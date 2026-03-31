import { getBlobUrl } from './blob'
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
    const res = await fetch(getBlobUrl(`${tenant}/config/figma-foundation.json`), { cache: 'no-store' })
    if (!res.ok) return EMPTY
    return (await res.json()) as FigmaFoundationData
  } catch {
    return EMPTY
  }
}
