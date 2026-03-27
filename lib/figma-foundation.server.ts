import type { FigmaFoundationData } from '@/types'

const EMPTY: FigmaFoundationData = {
  lastSynced: null,
  icons: [],
  textStyles: [],
  effectStyles: [],
}

export async function getFigmaFoundationData(tenant: string): Promise<FigmaFoundationData> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return EMPTY
  try {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: `${tenant}/config/figma-foundation` })
    if (blobs.length === 0) return EMPTY
    const latest = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]
    const res = await fetch(latest.url, { cache: 'no-store' })
    if (!res.ok) return EMPTY
    return (await res.json()) as FigmaFoundationData
  } catch {
    return EMPTY
  }
}
