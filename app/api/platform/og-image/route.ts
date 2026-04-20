import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put, del } from '@vercel/blob'
import { getPlatformConfig, savePlatformConfig } from '@/lib/platform-config.server'

export async function GET() {
  const config = await getPlatformConfig()
  return NextResponse.json({ url: config.defaultOgImageUrl || null })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  if (role !== 'platform_editor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const allowed = ['png', 'jpg', 'jpeg', 'webp', 'gif']
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  const existing = await getPlatformConfig()

  // Upload with a unique suffix so each upload gets a fresh URL — avoids CDN
  // serving a stale cached image when the file is replaced.
  const blob = await put(`_platform/config/og-image.${ext}`, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: true,
  })

  // Delete the old blob if it exists and is different from the new one
  if (existing.defaultOgImageUrl && existing.defaultOgImageUrl !== blob.url) {
    try { await del(existing.defaultOgImageUrl) } catch { /* ignore if already gone */ }
  }

  await savePlatformConfig({ ...existing, defaultOgImageUrl: blob.url })

  return NextResponse.json({ url: blob.url })
}
