import { list, put } from '@vercel/blob'

const TOKEN = 'vercel_blob_rw_Qcfk7CoB5tsyagWB_TU7Q95vsPZXMjEMuBrI8ocseYFIonU'
const TENANT = 'fics'

process.env.BLOB_READ_WRITE_TOKEN = TOKEN

async function getLatest(prefix) {
  const { blobs } = await list({ prefix, token: TOKEN })
  if (!blobs.length) return null
  return blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0]
}

async function copyBlob(srcPrefix, destPath) {
  const blob = await getLatest(srcPrefix)
  if (!blob) { console.log(`  ⚠ No blob found for prefix: ${srcPrefix}`); return }
  const res = await fetch(blob.url)
  if (!res.ok) { console.log(`  ⚠ Failed to fetch ${blob.url}`); return }
  const data = await res.text()
  await put(destPath, data, { access: 'public', addRandomSuffix: false, token: TOKEN })
  console.log(`  ✓ ${srcPrefix} → ${destPath}`)
}

async function main() {
  console.log('Migrating FICS data to AllDS...\n')

  // 1. Register the fics tenant
  const registryBlob = await getLatest('_registry/tenants')
  const tenants = registryBlob ? await fetch(registryBlob.url).then(r => r.json()) : []
  if (!tenants.find(t => t.slug === TENANT)) {
    tenants.push({ slug: TENANT, name: 'FICS Design System', description: 'FICS component library', createdAt: new Date().toISOString() })
    await put('_registry/tenants.json', JSON.stringify(tenants), { access: 'public', addRandomSuffix: false, token: TOKEN })
    console.log('  ✓ Registered fics tenant\n')
  } else {
    console.log('  ℹ fics tenant already registered\n')
  }

  // 2. Copy data blobs
  console.log('Copying blobs:')
  await copyBlob('config/figma-components', `${TENANT}/config/figma-components.json`)
  await copyBlob('config/figma-foundation', `${TENANT}/config/figma-foundation.json`)
  await copyBlob('config/settings',         `${TENANT}/config/settings.json`)
  await copyBlob('tokens/tokens',            `${TENANT}/tokens/tokens.json`)

  console.log('\nDone! Visit https://allds.vercel.app/fics to see the result.')
}

main().catch(console.error)
