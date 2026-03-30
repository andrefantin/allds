import type { FigmaComponent, ComponentStatus, FigmaIcon, FigmaTextStyle, FigmaEffectStyle } from '@/types'

const FIGMA_API_BASE = 'https://api.figma.com/v1'

function getHeaders() {
  return {
    'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN || '',
  }
}

export async function fetchFigmaComponents(fileId: string): Promise<FigmaComponent[]> {
  // component_sets returns top-level named groups (e.g. "Button") rather than
  // every individual variant (e.g. "Button/Primary/Large/Hover")
  const res = await fetch(`${FIGMA_API_BASE}/files/${fileId}/component_sets`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`Figma API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const componentSets: Record<string, unknown>[] = data.meta?.component_sets || []

  // Deduplicate by slug so repeated frames don't create duplicate entries
  const seen = new Set<string>()
  const result: FigmaComponent[] = []

  for (const c of componentSets) {
    const name = (c.name as string) || ''
    const slug = nameToSlug(name)
    if (seen.has(slug)) continue
    seen.add(slug)

    const description = (c.description as string) || ''
    const status = extractStatus(description)
    const cleanDescription = description.replace(/\[status:\s*\w+\]/i, '').trim()

    result.push({
      id: c.node_id as string,
      key: c.key as string,
      name,
      slug,
      description: cleanDescription,
      status,
      group: extractGroup(name),
      fileType: 'components' as const,
      figmaUrl: `https://www.figma.com/file/${fileId}?node-id=${encodeURIComponent(c.node_id as string)}`,
    })
  }

  return result
}

export async function fetchFigmaModules(fileId: string): Promise<FigmaComponent[]> {
  const components = await fetchFigmaComponents(fileId)
  return components.map((c) => ({ ...c, fileType: 'modules' as const }))
}

export async function fetchComponentImages(
  fileId: string,
  nodeIds: string[]
): Promise<Record<string, string>> {
  if (nodeIds.length === 0) return {}

  const ids = nodeIds.join(',')
  const res = await fetch(
    `${FIGMA_API_BASE}/images/${fileId}?ids=${encodeURIComponent(ids)}&scale=2&format=png`,
    {
      headers: getHeaders(),
      next: { revalidate: 3600 },
    }
  )

  if (!res.ok) return {}

  const data = await res.json()
  return data.images || {}
}

export async function fetchFigmaFileMetadata(fileId: string) {
  const res = await fetch(`${FIGMA_API_BASE}/files/${fileId}?depth=1`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  })

  if (!res.ok) return null

  const data = await res.json()
  return {
    name: data.name,
    lastModified: data.lastModified,
    version: data.version,
  }
}

export async function fetchFigmaVariables(fileId: string) {
  const res = await fetch(`${FIGMA_API_BASE}/files/${fileId}/variables/local`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  })

  if (!res.ok) return null

  return res.json()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractStatus(description: string): ComponentStatus {
  const match = description.match(/\[status:\s*(stable|beta|deprecated|new)\]/i)
  if (!match) return 'stable'
  return match[1].toLowerCase() as ComponentStatus
}

function extractGroup(name: string): string {
  // "Button/Primary" → "Button"
  // "Forms/Input/Default" → "Forms"
  const parts = name.split('/')
  return parts.length > 1 ? parts[0].trim() : 'General'
}

function nameToSlug(name: string): string {
  return name
    .split('/')[0]
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

const ICON_SIZES = [8, 12, 16, 20, 24, 32, 40, 48]

function normalizeNodeId(id: string): string {
  // URL format uses "-" (e.g. "9868-86"), API needs ":" (e.g. "9868:86")
  return /^[\d-]+$/.test(id) ? id.replace(/-/g, ':') : id
}

function parseIconName(name: string, parentName: string): { name: string; size: number } {
  // Variant properties: "Size=24, Name=arrow-left"
  if (name.includes('=')) {
    const props: Record<string, string> = {}
    name.split(',').forEach((s) => {
      const [k, v] = s.trim().split('=').map((p) => p.trim())
      if (k && v) props[k.toLowerCase()] = v
    })
    const size = props.size ? parseInt(props.size) : 24
    const iconName = props.type || props.name || props.iconname || parentName || name
    return { name: cleanIconName(iconName), size: ICON_SIZES.includes(size) ? size : 24 }
  }

  // Parent is a size number: parent="24", name="arrow-left"
  const parentNum = parseInt(parentName.trim())
  if (!isNaN(parentNum) && ICON_SIZES.includes(parentNum)) {
    return { name: cleanIconName(name), size: parentNum }
  }

  // Size embedded in name: "arrow-left-24" or "24/arrow-left"
  for (const sz of ICON_SIZES) {
    if (new RegExp(`\\b${sz}\\b`).test(name)) {
      const cleanedName = name.replace(new RegExp(`\\b${sz}\\b`, 'g'), '').replace(/^[^a-zA-Z]+|[^a-zA-Z0-9]+$/g, '').trim()
      return { name: cleanIconName(cleanedName || name), size: sz }
    }
  }

  return { name: cleanIconName(name), size: 24 }
}

function cleanIconName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
}

function extractIconCategory(parentName: string): string {
  if (!parentName) return 'General'
  const asNum = parseInt(parentName.trim())
  if (!isNaN(asNum) && ICON_SIZES.includes(asNum)) return 'General'
  return parentName.replace(/[^\w\s]/g, '').trim() || 'General'
}

export async function fetchFigmaIcons(
  fileId: string,
  iconNodeId: string,
  { preserveColors = false }: { preserveColors?: boolean } = {}
): Promise<FigmaIcon[]> {
  const nodeId = normalizeNodeId(iconNodeId)

  const nodeRes = await fetch(
    `${FIGMA_API_BASE}/files/${fileId}/nodes?ids=${encodeURIComponent(nodeId)}&depth=5`,
    { headers: getHeaders() }
  )
  if (!nodeRes.ok) throw new Error(`Figma nodes API error: ${nodeRes.status}`)

  const nodeData = await nodeRes.json()
  const rootEntry = nodeData.nodes?.[nodeId]
  if (!rootEntry) throw new Error(`Icon node "${nodeId}" not found`)

  const rootDoc = rootEntry.document as Record<string, unknown>

  // Collect COMPONENT nodes
  interface IconCandidate { id: string; name: string; parentName: string }
  const candidates: IconCandidate[] = []

  function traverse(node: Record<string, unknown>, parentName: string, depth: number) {
    if (depth > 6) return
    const type = node.type as string
    const name = (node.name as string) || ''

    if (type === 'COMPONENT') {
      candidates.push({ id: (node.id as string) || '', name, parentName })
    } else if (Array.isArray(node.children)) {
      const nextParent = (type === 'COMPONENT_SET' || type === 'FRAME' || type === 'GROUP') ? name : parentName
      for (const child of node.children as Record<string, unknown>[]) {
        traverse(child, nextParent, depth + 1)
      }
    }
  }
  traverse(rootDoc, '', 0)

  if (candidates.length === 0) return []

  // Batch SVG URL fetches (50 at a time)
  const svgUrls: Record<string, string> = {}
  const URL_BATCH = 50
  for (let i = 0; i < candidates.length; i += URL_BATCH) {
    const batch = candidates.slice(i, i + URL_BATCH)
    const ids = batch.map((c) => c.id).join(',')
    try {
      const imgRes = await fetch(
        `${FIGMA_API_BASE}/images/${fileId}?ids=${encodeURIComponent(ids)}&format=svg&svg_include_id=false`,
        { headers: getHeaders() }
      )
      if (imgRes.ok) {
        const imgData = await imgRes.json()
        Object.assign(svgUrls, imgData.images || {})
      }
    } catch { /* skip batch on error */ }
  }

  // Fetch SVG content concurrently (20 at a time)
  const icons: FigmaIcon[] = []
  const CONCURRENCY = 20

  for (let i = 0; i < candidates.length; i += CONCURRENCY) {
    const batch = candidates.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(
      batch.map(async (c): Promise<FigmaIcon | null> => {
        const url = svgUrls[c.id]
        if (!url) return null
        const r = await fetch(url)
        if (!r.ok) return null
        let svg = await r.text()
        if (!preserveColors) {
          svg = svg
            .replace(/fill="(?!none)[^"]+"/g, 'fill="currentColor"')
            .replace(/stroke="(?!none)[^"]+"/g, 'stroke="currentColor"')
        }
        const { name, size } = parseIconName(c.name, c.parentName)
        if (!name) return null
        // Group icons by size — category is used as the group label
        return { id: c.id, name, size, category: `${size}px`, svgContent: svg }
      })
    )
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) icons.push(r.value)
    }
  }

  // Deduplicate by name+size
  const seen = new Set<string>()
  return icons.filter((icon) => {
    const key = `${icon.name}-${icon.size}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function fetchFigmaTextStyles(fileId: string): Promise<FigmaTextStyle[]> {
  const stylesRes = await fetch(`${FIGMA_API_BASE}/files/${fileId}/styles`, {
    headers: getHeaders(),
  })
  if (!stylesRes.ok) throw new Error(`Figma styles error: ${stylesRes.status}`)
  const stylesData = await stylesRes.json()

  const textStyles = ((stylesData.meta?.styles || []) as Record<string, unknown>[]).filter(
    (s) => s.style_type === 'TEXT'
  )
  if (textStyles.length === 0) return []

  // Fetch node properties in batches
  const nodeProps: Record<string, Record<string, unknown>> = {}
  const BATCH = 50
  for (let i = 0; i < textStyles.length; i += BATCH) {
    const batch = textStyles.slice(i, i + BATCH)
    const ids = batch.map((s) => (s.node_id as string).replace(/-/g, ':')).join(',')
    try {
      const nodeRes = await fetch(
        `${FIGMA_API_BASE}/files/${fileId}/nodes?ids=${encodeURIComponent(ids)}`,
        { headers: getHeaders() }
      )
      if (nodeRes.ok) {
        const nodeData = await nodeRes.json()
        Object.assign(nodeProps, nodeData.nodes || {})
      }
    } catch { /* skip */ }
  }

  return textStyles.map((s) => {
    const rawId = s.node_id as string
    const nodeId = rawId.replace(/-/g, ':')
    const doc = (nodeProps[nodeId]?.document || {}) as Record<string, unknown>
    const style = (doc.style || {}) as Record<string, unknown>
    const name = (s.name as string) || ''
    const parts = name.split('/')
    const category = parts.length > 1 ? parts[0].trim() : 'General'

    return {
      id: rawId,
      name,
      category,
      fontFamily: (style.fontFamily as string) || '',
      fontWeight: (style.fontWeight as number) || 400,
      fontSize: (style.fontSize as number) || 16,
      lineHeightPx: (style.lineHeightPx as number) || 0,
      letterSpacingPx: (style.letterSpacing as number) || 0,
      textCase: style.textCase as string | undefined,
    }
  })
}

export async function fetchFigmaEffectStyles(fileId: string): Promise<FigmaEffectStyle[]> {
  const stylesRes = await fetch(`${FIGMA_API_BASE}/files/${fileId}/styles`, {
    headers: getHeaders(),
  })
  if (!stylesRes.ok) return []
  const stylesData = await stylesRes.json()

  const effectStyles = ((stylesData.meta?.styles || []) as Record<string, unknown>[]).filter(
    (s) => s.style_type === 'EFFECT'
  )
  if (effectStyles.length === 0) return []

  const ids = effectStyles.map((s) => (s.node_id as string).replace(/-/g, ':')).join(',')
  const nodeRes = await fetch(
    `${FIGMA_API_BASE}/files/${fileId}/nodes?ids=${encodeURIComponent(ids)}`,
    { headers: getHeaders() }
  )
  if (!nodeRes.ok) return []

  const nodeData = await nodeRes.json()

  return effectStyles.map((s) => {
    const rawId = s.node_id as string
    const nodeId = rawId.replace(/-/g, ':')
    const doc = (nodeData.nodes?.[nodeId]?.document || {}) as Record<string, unknown>
    const effects = (doc.effects || []) as Record<string, unknown>[]
    const name = (s.name as string) || ''
    const parts = name.split('/')
    const category = parts.length > 1 ? parts[0].trim() : 'General'

    const shadows = effects
      .filter((e) => e.type === 'DROP_SHADOW' && e.visible !== false)
      .map((e) => {
        const c = e.color as { r: number; g: number; b: number; a: number }
        const o = e.offset as { x: number; y: number }
        const r = Math.round((c?.r || 0) * 255)
        const g = Math.round((c?.g || 0) * 255)
        const b = Math.round((c?.b || 0) * 255)
        const a = ((c?.a || 0)).toFixed(2)
        return `${o?.x || 0}px ${o?.y || 0}px ${e.radius || 0}px ${e.spread || 0}px rgba(${r},${g},${b},${a})`
      })

    return {
      id: rawId,
      name,
      category,
      cssBoxShadow: shadows.length > 0 ? shadows.join(', ') : 'none',
    }
  })
}

function isFigmaNodeId(id: string): boolean {
  // Figma node IDs look like "1234:567" or "1234-567" — only digits and one separator
  // Slugs always contain letters, so this is a reliable distinguisher
  return /^\d+[:‑-]\d+$/.test(id) || /^\d+:\d+$/.test(id)
}

function normalizeInstanceName(name: string): string {
  return name
    .split('/')[0]
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-\d+$/, '') // strip trailing numbers like "Button 2" → "button"
}

export async function fetchComponentsUsedInModule(
  fileId: string,
  moduleNodeId: string,
  knownComponents: FigmaComponent[]
): Promise<FigmaComponent[]> {
  if (!isFigmaNodeId(moduleNodeId)) return []

  const nodeId = normalizeNodeId(moduleNodeId)

  let data: Record<string, unknown>
  try {
    const res = await fetch(
      `${FIGMA_API_BASE}/files/${fileId}/nodes?ids=${encodeURIComponent(nodeId)}&depth=6`,
      { headers: getHeaders(), next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    data = await res.json()
  } catch {
    return []
  }

  const rootEntry = (data.nodes as Record<string, unknown>)?.[nodeId] as Record<string, unknown> | undefined
  if (!rootEntry) return []

  const rootDoc = rootEntry.document as Record<string, unknown>

  // Collect unique normalized instance names
  const instanceNames = new Set<string>()
  function traverse(node: Record<string, unknown>) {
    if (node.type === 'INSTANCE') {
      const normalized = normalizeInstanceName((node.name as string) || '')
      if (normalized) instanceNames.add(normalized)
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children as Record<string, unknown>[]) {
        traverse(child)
      }
    }
  }
  traverse(rootDoc)

  if (instanceNames.size === 0) return []

  // Match against known components by slug or normalized name
  const matched: FigmaComponent[] = []
  const seen = new Set<string>()

  for (const comp of knownComponents) {
    if (seen.has(comp.slug)) continue
    const compNameNormalized = normalizeInstanceName(comp.name)
    if (instanceNames.has(comp.slug) || instanceNames.has(compNameNormalized)) {
      matched.push(comp)
      seen.add(comp.slug)
    }
  }

  return matched.sort((a, b) => a.name.localeCompare(b.name))
}

export function getFigmaEmbedUrl(fileId: string, nodeId?: string): string {
  const base = `https://www.figma.com/embed?embed_host=fics-platform&url=${encodeURIComponent(`https://www.figma.com/file/${fileId}`)}`
  if (nodeId) return base + `&node-id=${encodeURIComponent(nodeId)}`
  return base
}
