/**
 * Derives the public base URL of the Vercel Blob store from the token.
 * Token format: vercel_blob_rw_<storeId>_<secret>
 * Blob URL format: https://<storeId>.public.blob.vercel-storage.com/<path>
 *
 * This avoids calling list() (an "advanced operation" with quota limits)
 * for every read — instead we construct the URL directly and use plain fetch().
 */
function getBlobBaseUrl(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? ''
  const match = token.match(/^vercel_blob_rw_([^_]+)_/)
  if (!match) throw new Error('Cannot derive blob store URL from BLOB_READ_WRITE_TOKEN')
  return `https://${match[1]}.public.blob.vercel-storage.com`
}

export function getBlobUrl(pathname: string): string {
  return `${getBlobBaseUrl()}/${pathname}`
}
