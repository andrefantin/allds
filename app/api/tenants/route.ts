import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTenants, createTenant } from '@/lib/tenant.server'

export async function GET() {
  const tenants = await getTenants()
  return NextResponse.json(tenants)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const isEditor = (session?.user as { role?: string })?.role === 'editor'
  if (!isEditor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug, name, description } = await req.json()
  if (!slug || !name) return NextResponse.json({ error: 'slug and name required' }, { status: 400 })

  try {
    const tenant = await createTenant(slug, name, description)
    return NextResponse.json(tenant)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 400 })
  }
}
