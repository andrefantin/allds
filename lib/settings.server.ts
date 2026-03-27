import type { PlatformSettings } from '@/types'

export async function getSettings(tenant: string): Promise<PlatformSettings> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import('@vercel/blob')
      const { blobs } = await list({ prefix: `${tenant}/config/settings` })
      if (blobs.length > 0) {
        const latest = blobs.sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )[0]
        const res = await fetch(latest.url, { cache: 'no-store' })
        if (res.ok) return (await res.json()) as PlatformSettings
      }
    } catch (err) {
      console.warn('Failed to read settings from Blob:', err)
    }
  }
  return {}
}

export async function saveSettings(tenant: string, settings: PlatformSettings): Promise<void> {
  const { put } = await import('@vercel/blob')
  await put(`${tenant}/config/settings.json`, JSON.stringify(settings), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: true,
  })
}
