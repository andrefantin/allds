import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put, del } from '@vercel/blob'
import { getSettings, saveSettings } from '@/lib/settings.server'

export async function POST(req: Request, { params }: { params: { tenant: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  const isEditor = role === 'editor' || role === 'platform_editor'
  if (!isEditor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const allowed = ['png', 'jpg', 'jpeg', 'webp', 'gif']
  if (!allowed.includes(ext)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })

  const { tenant } = params
  const existing = await getSettings(tenant)

  // Upload with a unique suffix so each upload gets a fresh URL — avoids CDN
  // serving a stale cached image when the file is replaced.
  const blob = await put(`${tenant}/config/og-image.${ext}`, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: true,
  })

  // Delete the old blob if it exists and is different from the new one
  if (existing.ogImageUrl && existing.ogImageUrl !== blob.url) {
    try { await del(existing.ogImageUrl) } catch { /* ignore if already gone */ }
  }

  await saveSettings(tenant, { ...existing, ogImageUrl: blob.url })

  return NextResponse.json({ url: blob.url })
}
