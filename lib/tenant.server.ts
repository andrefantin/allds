/**
 * Server-only tenant management utilities.
 * Tenants are stored in Vercel Blob at _registry/tenants.json
 */

import { getBlobUrl } from './blob'
import type { Tenant } from '@/types'

const REGISTRY_PATH = '_registry/tenants.json'

export async function getTenants(): Promise<Tenant[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return []
  try {
    const res = await fetch(getBlobUrl(REGISTRY_PATH), { cache: 'no-store' })
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
  const tenants = await getTenants()
  await saveTenants(tenants.filter((t) => t.slug !== slug))
}

export async function getTenant(slug: string): Promise<Tenant | null> {
  const tenants = await getTenants()
  return tenants.find((t) => t.slug === slug) ?? null
}
