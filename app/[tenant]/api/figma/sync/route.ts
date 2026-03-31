import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSettings } from '@/lib/settings.server'
import { fetchFigmaComponents, fetchFigmaModules } from '@/lib/figma'
import { put } from '@vercel/blob'

export async function POST(_req: Request, { params }: { params: { tenant: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  const isEditor = role === 'editor' || role === 'platform_editor'
  if (!isEditor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tenant } = params
  const settings = await getSettings(tenant)
  if (!settings.figmaToken) return NextResponse.json({ error: 'No Figma token configured' }, { status: 400 })

  process.env.FIGMA_ACCESS_TOKEN = settings.figmaToken

  try {
    let components: Awaited<ReturnType<typeof fetchFigmaComponents>> = []
    let modules: Awaited<ReturnType<typeof fetchFigmaModules>> = []

    if (settings.figmaFileComponents) {
      components = await fetchFigmaComponents(settings.figmaFileComponents)
    }
    if (settings.figmaFileModules) {
      modules = await fetchFigmaModules(settings.figmaFileModules)
    }

    const payload = { components, modules, lastSynced: new Date().toISOString() }
    await put(`${tenant}/config/figma-components.json`, JSON.stringify(payload), {
      access: 'public', contentType: 'application/json', addRandomSuffix: false,
    })

    return NextResponse.json({ ok: true, components: components.length, modules: modules.length })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Sync failed' }, { status: 500 })
  }
}
