import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsers, createUser, deleteUser } from '@/lib/users.server'
import bcrypt from 'bcryptjs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPlatformEditor(session: any) {
  return session?.user?.role === 'platform_editor'
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!isPlatformEditor(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const users = await getUsers()
  return NextResponse.json(users.map(({ email, role, tenant }) => ({ email, role, tenant })))
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!isPlatformEditor(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { email, password, role, tenant } = await req.json()
  if (!email || !password || !role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (role !== 'platform_editor' && !tenant) {
    return NextResponse.json({ error: 'Tenant required for non-admin users' }, { status: 400 })
  }
  const passwordHash = await bcrypt.hash(password, 10)
  try {
    await createUser({ email, passwordHash, role, tenant: role === 'platform_editor' ? undefined : tenant })
    return NextResponse.json({ email, role, tenant: role === 'platform_editor' ? undefined : tenant })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!isPlatformEditor(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  await deleteUser(email)
  return NextResponse.json({ ok: true })
}
