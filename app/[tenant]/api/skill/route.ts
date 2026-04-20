import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSkill, saveSkill } from '@/lib/skill.server'

export async function GET(_req: Request, { params }: { params: { tenant: string } }) {
  const content = await getSkill(params.tenant)
  if (!content) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return new Response(content, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}

export async function POST(req: Request, { params }: { params: { tenant: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  const isEditor = role === 'editor' || role === 'platform_editor'
  if (!isEditor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const content = await req.text()
  if (!content.trim()) return NextResponse.json({ error: 'Empty skill file' }, { status: 400 })

  await saveSkill(params.tenant, content)
  return NextResponse.json({ ok: true })
}
