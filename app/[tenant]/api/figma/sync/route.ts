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

  const figmaToken = settings.figmaToken

  try {
    let components: Awaited<ReturnType<typeof fetchFigmaComponents>> = []
    let modules: Awaited<ReturnType<typeof fetchFigmaModules>> = []

    if (settings.figmaFileComponents) {
      components = await fetchFigmaComponents(settings.figmaFileComponents, figmaToken)
    }
    if (settings.figmaFileModules) {
      modules = await fetchFigmaModules(settings.figmaFileModules, figmaToken)
    }

    // Sync additional libraries (modules only)
    const additionalLibraries: Array<{ name: string; modules: typeof modules }> = []
    for (const lib of settings.figmaAdditionalLibraries ?? []) {
      if (!lib.fileId || !lib.name) continue
      try {
        const libModules = await fetchFigmaModules(lib.fileId, figmaToken)
        additionalLibraries.push({ name: lib.name, modules: libModules })
      } catch (err) {
        console.warn(`Failed to sync additional library "${lib.name}":`, err)
      }
    }

    const payload = { components, modules, additionalLibraries, lastSynced: new Date().toISOString() }
    await put(`${tenant}/config/figma-components.json`, JSON.stringify(payload), {
      access: 'public', contentType: 'application/json', addRandomSuffix: false,
    })

    return NextResponse.json({
      ok: true,
      components: components.length,
      modules: modules.length,
      additionalLibraries: additionalLibraries.map((l) => ({ name: l.name, count: l.modules.length })),
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Sync failed' }, { status: 500 })
  }
}
