import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSettings } from '@/lib/settings.server'
import { fetchFigmaIcons, fetchFigmaTextStyles, fetchFigmaEffectStyles } from '@/lib/figma'
import { put } from '@vercel/blob'
import type { FigmaIcon, FigmaTextStyle, FigmaEffectStyle, FigmaIconSet } from '@/types'

export async function POST(_req: Request, { params }: { params: { tenant: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  const isEditor = role === 'editor' || role === 'platform_editor'
  if (!isEditor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tenant } = params
  const settings = await getSettings(tenant)
  if (!settings.figmaToken) return NextResponse.json({ error: 'No Figma token configured' }, { status: 400 })
  if (!settings.figmaFileFoundation) return NextResponse.json({ error: 'No Foundation file ID configured' }, { status: 400 })

  process.env.FIGMA_ACCESS_TOKEN = settings.figmaToken

  let icons: FigmaIcon[] = []
  const iconSets: FigmaIconSet[] = []
  let textStyles: FigmaTextStyle[] = []
  let effectStyles: FigmaEffectStyle[] = []
  const errors: string[] = []

  if (settings.figmaIconNodeId) {
    const nodeId = settings.figmaIconNodeId.replace(':', '-')
    const setName = settings.figmaIconSetName || 'Icons'
    try {
      const setIcons = await fetchFigmaIcons(settings.figmaFileFoundation, nodeId)
      iconSets.push({ name: setName, icons: setIcons })
      icons = setIcons
    } catch (e) { errors.push(`${setName}: ${e} (file: ${settings.figmaFileFoundation}, node: ${nodeId})`) }
  }

  if (settings.figmaIconNodeId2) {
    const nodeId = settings.figmaIconNodeId2.replace(':', '-')
    const setName = settings.figmaIconSetName2 || 'Spot Icons'
    try {
      const setIcons = await fetchFigmaIcons(settings.figmaFileFoundation, nodeId)
      iconSets.push({ name: setName, icons: setIcons })
    } catch (e) { errors.push(`${setName}: ${e} (file: ${settings.figmaFileFoundation}, node: ${nodeId})`) }
  }

  try { textStyles = await fetchFigmaTextStyles(settings.figmaFileFoundation) } catch (e) { errors.push(`Text styles: ${e}`) }
  try { effectStyles = await fetchFigmaEffectStyles(settings.figmaFileFoundation) } catch (e) { errors.push(`Effect styles: ${e}`) }

  const totalIcons = iconSets.reduce((sum, s) => sum + s.icons.length, 0)
  const payload = { icons, iconSets, textStyles, effectStyles, lastSynced: new Date().toISOString() }
  await put(`${tenant}/config/figma-foundation.json`, JSON.stringify(payload), {
    access: 'public', contentType: 'application/json', addRandomSuffix: true,
  })

  return NextResponse.json({ ok: true, icons: totalIcons, iconSets: iconSets.map(s => ({ name: s.name, count: s.icons.length })), textStyles: textStyles.length, effectStyles: effectStyles.length, errors })
}
