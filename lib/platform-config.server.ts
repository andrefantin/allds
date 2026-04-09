import { getBlobUrl } from './blob'

export interface PlatformConfig {
  defaultOgImageUrl?: string
}

const BLOB_PATH = '_platform/config/settings.json'

export async function getPlatformConfig(): Promise<PlatformConfig> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return {}
  try {
    const res = await fetch(getBlobUrl(BLOB_PATH), { cache: 'no-store' })
    if (!res.ok) return {}
    return (await res.json()) as PlatformConfig
  } catch {
    return {}
  }
}

export async function savePlatformConfig(config: PlatformConfig): Promise<void> {
  const { put } = await import('@vercel/blob')
  await put(BLOB_PATH, JSON.stringify(config), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  })
}
