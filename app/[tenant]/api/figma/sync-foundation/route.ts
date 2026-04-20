import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSettings } from '@/lib/settings.server'
import { fetchFigmaIcons, fetchFigmaTextStyles, fetchFigmaEffectStyles } from '@/lib/figma'
import { put } from '@vercel/blob'
import type { FigmaIcon, FigmaTextStyle, FigmaEffectStyle, FigmaIconSet, FigmaIconSetConfig } from '@/types'

export async function POST(_req: Request, { params }: { params: { tenant: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  const isEditor = role === 'editor' || role === 'platform_editor'
  if (!isEditor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tenant } = params
  const settings = await getSettings(tenant)
  if (!settings.figmaToken) return NextResponse.json({ error: 'No Figma token configured' }, { status: 400 })
  if (!settings.figmaFileFoundation) return NextResponse.json({ error: 'No Foundation file ID configured' }, { status: 400 })

  const figmaToken = settings.figmaToken

  // Resolve icon set configs: prefer new array, fall back to legacy fields
  const iconSetConfigs: FigmaIconSetConfig[] = settings.figmaIconSets ?? [
    ...(settings.figmaIconNodeId
      ? [{ name: settings.figmaIconSetName || 'System icons', nodeId: settings.figmaIconNodeId, preserveColors: false }]
      : []),
    ...(settings.figmaIconNodeId2
      ? [{ name: settings.figmaIconSetName2 || 'Spot Icons', nodeId: settings.figmaIconNodeId2, preserveColors: true }]
      : []),
  ]

  let icons: FigmaIcon[] = []
  const iconSets: FigmaIconSet[] = []
  let textStyles: FigmaTextStyle[] = []
  let effectStyles: FigmaEffectStyle[] = []
  const errors: string[] = []

  for (const config of iconSetConfigs) {
    if (!config.nodeId) continue
    const nodeId = config.nodeId.replace(':', '-')
    const setName = config.name || 'Icons'
    try {
      const setIcons = await fetchFigmaIcons(
        settings.figmaFileFoundation,
        nodeId,
        { preserveColors: config.preserveColors ?? false },
        figmaToken
      )
      iconSets.push({ name: setName, icons: setIcons })
      if (iconSets.length === 1) icons = setIcons
    } catch (e) {
      errors.push(`${setName}: ${e} (file: ${settings.figmaFileFoundation}, node: ${nodeId})`)
    }
  }

  try { textStyles = await fetchFigmaTextStyles(settings.figmaFileFoundation, figmaToken) } catch (e) { errors.push(`Text styles: ${e}`) }
  try { effectStyles = await fetchFigmaEffectStyles(settings.figmaFileFoundation, figmaToken) } catch (e) { errors.push(`Effect styles: ${e}`) }

  const totalIcons = iconSets.reduce((sum, s) => sum + s.icons.length, 0)
  const payload = { icons, iconSets, textStyles, effectStyles, lastSynced: new Date().toISOString() }
  await put(`${tenant}/config/figma-foundation.json`, JSON.stringify(payload), {
    access: 'public', contentType: 'application/json', addRandomSuffix: false,
  })

  return NextResponse.json({
    ok: true,
    icons: totalIcons,
    iconSets: iconSets.map((s) => ({ name: s.name, count: s.icons.length })),
    textStyles: textStyles.length,
    effectStyles: effectStyles.length,
    errors,
  })
}
