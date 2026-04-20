/**
 * Server-only tenant management utilities.
 * Tenants are stored in Vercel Blob at _registry/tenants.json
 */

import { getBlobUrl } from './blob'
import { getUsers, saveUsers } from './users.server'
import type { Tenant } from '@/types'

const REGISTRY_PATH = '_registry/tenants.json'

// Cache-Control: no-cache tells the Vercel Blob CDN to revalidate with the
// origin on every read, preventing stale data after a recent write.
const NO_CACHE_HEADERS = { 'Cache-Control': 'no-cache' }

export async function getTenants(): Promise<Tenant[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return []
  try {
    const res = await fetch(getBlobUrl(REGISTRY_PATH), { cache: 'no-store', headers: NO_CACHE_HEADERS })
    if (!res.ok) return []
    return (await res.json()) as Tenant[]
  } catch {
    return []
  }
}

export async function saveTenants(tenants: Tenant[]): Promise<void> {
  const { put } = await import('@vercel/blob')
  await put(REGISTRY_PATH, JSON.stringify(tenants), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  })
}

export async function createTenant(slug: string, name: string, description?: string): Promise<Tenant> {
  const tenants = await getTenants()
  if (tenants.find((t) => t.slug === slug)) {
    throw new Error(`Tenant "${slug}" already exists`)
  }
  const tenant: Tenant = {
    slug,
    name,
    description,
    createdAt: new Date().toISOString(),
  }
  await saveTenants([...tenants, tenant])
  return tenant
}

export async function deleteTenant(slug: string): Promise<void> {
  const [tenants, users] = await Promise.all([getTenants(), getUsers()])
  await Promise.all([
    saveTenants(tenants.filter((t) => t.slug !== slug)),
    saveUsers(users.filter((u) => u.tenant !== slug)),
  ])
}

export async function getTenant(slug: string): Promise<Tenant | null> {
  const tenants = await getTenants()
  return tenants.find((t) => t.slug === slug) ?? null
}
