import { getBlobUrl } from './blob'
import type { FigmaComponentsData, FigmaComponent, NavigationGroup } from '@/types'

const MODULE_GROUP_ORDER = [
  'Navigation', 'Homepage Header', 'Template Based', 'Page Header',
  'CTA', 'Content', 'Data', 'Form', 'Media', 'Promo', 'Search', 'Testimonial', 'Utility',
]

const EMPTY_DATA: FigmaComponentsData = {
  lastSynced: null,
  components: [],
  modules: [],
  navigation: { components: [], modules: [] },
}

function groupItems(items: FigmaComponent[]): NavigationGroup[] {
  const map = new Map<string, NavigationGroup>()
  for (const item of items) {
    if (!map.has(item.group)) map.set(item.group, { group: item.group, items: [] })
    const existing = map.get(item.group)!.items.find((i) => i.slug === item.slug)
    if (!existing) map.get(item.group)!.items.push({ name: item.name, slug: item.slug, status: item.status })
  }
  return Array.from(map.values())
}

function buildNavigation(components: FigmaComponent[], modules: FigmaComponent[]): FigmaComponentsData['navigation'] {
  const compGroups = groupItems(components)
  compGroups.sort((a, b) => a.group.localeCompare(b.group))
  compGroups.forEach((g) => g.items.sort((a, b) => a.name.localeCompare(b.name)))

  const modGroups = groupItems(modules)
  modGroups.forEach((g) => g.items.sort((a, b) => a.name.localeCompare(b.name)))
  modGroups.sort((a, b) => {
    const ai = MODULE_GROUP_ORDER.indexOf(a.group)
    const bi = MODULE_GROUP_ORDER.indexOf(b.group)
    if (ai === -1 && bi === -1) return a.group.localeCompare(b.group)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return { components: compGroups, modules: modGroups }
}

export async function getFigmaData(tenant: string): Promise<FigmaComponentsData> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return EMPTY_DATA
  try {
    const res = await fetch(getBlobUrl(`${tenant}/config/figma-components.json`), { cache: 'no-store' })
    if (!res.ok) return EMPTY_DATA
    const raw = await res.json()
    const components: FigmaComponent[] = raw.components || []
    const modules: FigmaComponent[] = raw.modules || []
    return {
      lastSynced: raw.lastSynced ?? null,
      components,
      modules,
      navigation: buildNavigation(components, modules),
    }
  } catch (err) {
    console.warn('Failed to read figma data from Blob:', err)
    return EMPTY_DATA
  }
}
