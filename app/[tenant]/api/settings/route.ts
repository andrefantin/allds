import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSettings, saveSettings } from '@/lib/settings.server'

export async function GET(_req: Request, { params }: { params: { tenant: string } }) {
  const settings = await getSettings(params.tenant)
  // Redact token for safety
  return NextResponse.json({ ...settings, figmaToken: settings.figmaToken ? '***' : undefined })
}

export async function POST(req: Request, { params }: { params: { tenant: string } }) {
  const session = await getServerSession(authOptions)
  const isEditor = (session?.user as { role?: string })?.role === 'editor'
  if (!isEditor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const existing = await getSettings(params.tenant)

  const ALLOWED_KEYS = ['figmaToken', 'figmaFileComponents', 'figmaFileModules', 'figmaFileFoundation', 'figmaIconNodeId']
  const updated = { ...existing }
  for (const key of ALLOWED_KEYS) {
    if (key in body) (updated as Record<string, string>)[key] = body[key]
  }

  await saveSettings(params.tenant, updated)
  return NextResponse.json({ ok: true })
}
