import { getBlobUrl } from './blob'

export interface SkillMeta {
  uploadedAt: string
}

export async function getSkill(tenant: string): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null
  try {
    const res = await fetch(getBlobUrl(`${tenant}/config/skill.skill`), { cache: 'no-store' })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

export async function getSkillMeta(tenant: string): Promise<SkillMeta | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null
  try {
    const res = await fetch(getBlobUrl(`${tenant}/config/skill-meta.json`), { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json() as SkillMeta
  } catch {
    return null
  }
}

export async function saveSkill(tenant: string, content: string): Promise<void> {
  const { put } = await import('@vercel/blob')
  await Promise.all([
    put(`${tenant}/config/skill.skill`, content, {
      access: 'public',
      contentType: 'text/plain',
      addRandomSuffix: false,
    }),
    put(`${tenant}/config/skill-meta.json`, JSON.stringify({ uploadedAt: new Date().toISOString() }), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    }),
  ])
}
