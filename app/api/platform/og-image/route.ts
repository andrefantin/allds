import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'
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

  const blob = await put(`_platform/config/og-image.${ext}`, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: false,
  })

  const existing = await getPlatformConfig()
  await savePlatformConfig({ ...existing, defaultOgImageUrl: blob.url })

  return NextResponse.json({ url: blob.url })
}
