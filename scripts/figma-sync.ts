#!/usr/bin/env tsx
/**
 * FICS Design System — Figma Sync Script
 * Runs pre-build to fetch component metadata and previews from Figma.
 *
 * Usage:
 *   pnpm figma-sync
 *   or automatically via: pnpm build (which calls this script first)
 */

import fs from 'fs'
import path from 'path'
import https from 'https'

const FIGMA_API_BASE = 'https://api.figma.com/v1'
const DATA_DIR = path.join(process.cwd(), 'data')
const PREVIEWS_DIR = path.join(process.cwd(), 'public', 'previews')

const token = process.env.FIGMA_ACCESS_TOKEN
const componentsFileId = process.env.FIGMA_COMPONENTS_FILE_ID
const modulesFileId = process.env.FIGMA_MODULES_FILE_ID

if (!token) {
  console.log('[figma-sync] FIGMA_ACCESS_TOKEN not set — skipping Figma sync')
  process.exit(0)
}

// ─── HTTP helper ─────────────────────────────────────────────────────────────

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { headers: { 'X-Figma-Token': token! } }, (res) => {
      let data = ''
      res.on('data', (chunk: string) => { data += chunk })
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error(`Failed to parse JSON: ${(e as Error).message}`)) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, (res) => {
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', (err) => {
      fs.unlink(dest, () => {})
      reject(err)
    })
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawFigmaComponent {
  node_id: string
  key: string
  name: string
  description: string
}

interface SyncedComponent {
  id: string
  key: string
  name: string
  slug: string
  description: string
  status: string
  group: string
  fileType: 'components' | 'modules'
  figmaUrl: string
  thumbnailUrl?: string
}

interface NavItem {
  name: string
  slug: string
  status: string
}

interface NavGroup {
  group: string
  items: NavItem[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractStatus(description: string): string {
  const match = description.match(/\[status:\s*(stable|beta|deprecated|new)\]/i)
  return match ? match[1].toLowerCase() : 'stable'
}

function nameToSlug(name: string): string {
  return name.split('/')[0].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function extractGroup(name: string): string {
  const parts = name.split('/')
  return parts.length > 1 ? parts[0].trim() : 'General'
}

// ─── Sync ────────────────────────────────────────────────────────────────────

async function syncFile(fileId: string, fileType: 'components' | 'modules'): Promise<SyncedComponent[]> {
  console.log(`[figma-sync] Fetching ${fileType} from file ${fileId}…`)

  const data = await fetchJson(`${FIGMA_API_BASE}/files/${fileId}/components`) as {
    meta?: { components: RawFigmaComponent[] }
  }
  const rawComponents = data.meta?.components || []
  console.log(`[figma-sync] Found ${rawComponents.length} ${fileType}`)

  const components: SyncedComponent[] = rawComponents.map((c) => ({
    id: c.node_id,
    key: c.key,
    name: c.name,
    slug: nameToSlug(c.name),
    description: c.description.replace(/\[status:\s*\w+\]/i, '').trim(),
    status: extractStatus(c.description),
    group: extractGroup(c.name),
    fileType,
    figmaUrl: `https://www.figma.com/file/${fileId}?node-id=${encodeURIComponent(c.node_id)}`,
  }))

  // Fetch thumbnails in batches of 25
  const batchSize = 25
  const imageMap: Record<string, string> = {}

  for (let i = 0; i < components.length; i += batchSize) {
    const batch = components.slice(i, i + batchSize)
    const ids = batch.map((c) => c.id).join(',')
    try {
      const imagesData = await fetchJson(
        `${FIGMA_API_BASE}/images/${fileId}?ids=${encodeURIComponent(ids)}&scale=2&format=png`
      ) as { images?: Record<string, string> }
      Object.assign(imageMap, imagesData.images || {})
    } catch (err) {
      console.warn(`[figma-sync] Failed to fetch images for batch ${i}:`, err)
    }
  }

  // Download thumbnails locally
  fs.mkdirSync(PREVIEWS_DIR, { recursive: true })
  const withThumbnails = await Promise.all(
    components.map(async (component) => {
      const imageUrl = imageMap[component.id]
      if (imageUrl) {
        const filename = `${fileType}-${component.slug}-${component.id.replace(':', '-')}.png`
        const localPath = path.join(PREVIEWS_DIR, filename)
        try {
          await downloadFile(imageUrl, localPath)
          return { ...component, thumbnailUrl: `/previews/${filename}` }
        } catch {
          return { ...component, thumbnailUrl: imageUrl }
        }
      }
      return component
    })
  )

  return withThumbnails
}

function buildNavigation(components: SyncedComponent[]): NavGroup[] {
  const groups: Record<string, NavItem[]> = {}

  for (const comp of components) {
    if (!groups[comp.group]) groups[comp.group] = []
    const existing = groups[comp.group]
    if (!existing.find((i) => i.slug === comp.slug)) {
      existing.push({ name: comp.name.split('/')[0], slug: comp.slug, status: comp.status })
    }
  }

  return Object.entries(groups).map(([group, items]) => ({ group, items }))
}

async function main() {
  console.log('[figma-sync] Starting Figma sync…')
  fs.mkdirSync(DATA_DIR, { recursive: true })

  const dataPath = path.join(DATA_DIR, 'figma-components.json')
  let existing: Record<string, unknown> = {}
  try {
    existing = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  } catch {}

  let allComponents: SyncedComponent[] = []
  let allModules: SyncedComponent[] = []
  let navComponents: NavGroup[] = []
  let navModules: NavGroup[] = []

  if (componentsFileId) {
    try {
      allComponents = await syncFile(componentsFileId, 'components')
      navComponents = buildNavigation(allComponents)
    } catch (err) {
      console.error('[figma-sync] Failed to sync components:', err)
    }
  }

  if (modulesFileId) {
    try {
      allModules = await syncFile(modulesFileId, 'modules')
      navModules = buildNavigation(allModules)
    } catch (err) {
      console.error('[figma-sync] Failed to sync modules:', err)
    }
  }

  const existingNav = existing.navigation as { components?: NavGroup[]; modules?: NavGroup[] } | undefined

  const updated = {
    ...existing,
    lastSynced: new Date().toISOString(),
    components: allComponents.length > 0 ? allComponents : (existing.components || []),
    modules: allModules.length > 0 ? allModules : (existing.modules || []),
    navigation: {
      components: navComponents.length > 0 ? navComponents : (existingNav?.components || []),
      modules: navModules.length > 0 ? navModules : (existingNav?.modules || []),
    },
  }

  fs.writeFileSync(dataPath, JSON.stringify(updated, null, 2), 'utf-8')
  console.log(`[figma-sync] Wrote ${dataPath}`)
  console.log(`[figma-sync] Done — ${allComponents.length} components, ${allModules.length} modules`)
}

main().catch((err) => {
  console.error('[figma-sync] Fatal error:', err)
  process.exit(1)
})
