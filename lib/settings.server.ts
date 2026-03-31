import { getBlobUrl } from './blob'
import type { PlatformSettings } from '@/types'

export async function getSettings(tenant: string): Promise<PlatformSettings> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return {}
  try {
    const res = await fetch(getBlobUrl(`${tenant}/config/settings.json`), { cache: 'no-store' })
    if (!res.ok) return {}
    return (await res.json()) as PlatformSettings
  } catch (err) {
    console.warn('Failed to read settings from Blob:', err)
    return {}
  }
}

export async function saveSettings(tenant: string, settings: PlatformSettings): Promise<void> {
  const { put } = await import('@vercel/blob')
  await put(`${tenant}/config/settings.json`, JSON.stringify(settings), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  })
}
