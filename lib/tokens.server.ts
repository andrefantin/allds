import { getBlobUrl } from './blob'
import type { TokenFile } from '@/types'

const EMPTY_TOKENS: TokenFile = {
  metadata: { version: '0.0.0', lastUpdated: new Date().toISOString(), source: 'empty' },
  collections: [],
}

export async function getTokens(tenant: string): Promise<TokenFile> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return EMPTY_TOKENS
  try {
    const res = await fetch(getBlobUrl(`${tenant}/tokens/current.json`), { cache: 'no-store' })
    if (!res.ok) return EMPTY_TOKENS
    return (await res.json()) as TokenFile
  } catch (err) {
    console.warn('Failed to read tokens from Blob:', err)
    return EMPTY_TOKENS
  }
}

export async function getTokenHistory(tenant: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return []
  try {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: `${tenant}/tokens/tokens-` })
    return blobs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 20)
      .map((b) => ({ url: b.url, uploadedAt: b.uploadedAt, pathname: b.pathname }))
  } catch {
    return []
  }
}
