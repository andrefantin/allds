import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteTenant } from '@/lib/tenant.server'

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  const isEditor = role === 'platform_editor' || role === 'editor'
  if (!isEditor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await deleteTenant(params.slug)
  return NextResponse.json({ ok: true })
}
