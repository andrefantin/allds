import { getBlobUrl } from './blob'
import type { FigmaComponentsData, FigmaComponent, FigmaAdditionalLibraryData, NavigationGroup } from '@/types'

const MODULE_GROUP_ORDER = [
  'Navigation', 'Homepage Header', 'Template Based', 'Page Header',
  'CTA', 'Content', 'Data', 'Form', 'Media', 'Promo', 'Search', 'Testimonial', 'Utility',
]

const EMPTY_DATA: FigmaComponentsData = {
  lastSynced: null,
  components: [],
  modules: [],
  additionalLibraries: [],
  navigation: { components: [], modules: [], additionalLibraries: [] },
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

function sortModuleGroups(groups: NavigationGroup[]): NavigationGroup[] {
  groups.forEach((g) => g.items.sort((a, b) => a.name.localeCompare(b.name)))
  groups.sort((a, b) => {
    const ai = MODULE_GROUP_ORDER.indexOf(a.group)
    const bi = MODULE_GROUP_ORDER.indexOf(b.group)
    if (ai === -1 && bi === -1) return a.group.localeCompare(b.group)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
  return groups
}

function buildNavigation(
  components: FigmaComponent[],
  modules: FigmaComponent[],
  additionalLibraries: FigmaAdditionalLibraryData[]
): FigmaComponentsData['navigation'] {
  const compGroups = groupItems(components)
  compGroups.sort((a, b) => a.group.localeCompare(b.group))
  compGroups.forEach((g) => g.items.sort((a, b) => a.name.localeCompare(b.name)))

  const modGroups = sortModuleGroups(groupItems(modules))

  const additionalLibraryNav = additionalLibraries.map((lib) => ({
    name: lib.name,
    groups: sortModuleGroups(groupItems(lib.modules)),
  }))

  return { components: compGroups, modules: modGroups, additionalLibraries: additionalLibraryNav }
}

export async function getFigmaData(tenant: string): Promise<FigmaComponentsData> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return EMPTY_DATA
  try {
    const res = await fetch(getBlobUrl(`${tenant}/config/figma-components.json`), { cache: 'no-store' })
    if (!res.ok) return EMPTY_DATA
    const raw = await res.json()
    const components: FigmaComponent[] = raw.components || []
    const modules: FigmaComponent[] = raw.modules || []
    const additionalLibraries: FigmaAdditionalLibraryData[] = raw.additionalLibraries || []
    return {
      lastSynced: raw.lastSynced ?? null,
      components,
      modules,
      additionalLibraries,
      navigation: buildNavigation(components, modules, additionalLibraries),
    }
  } catch (err) {
    console.warn('Failed to read figma data from Blob:', err)
    return EMPTY_DATA
  }
}
