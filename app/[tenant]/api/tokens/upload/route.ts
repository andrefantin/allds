import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function POST(req: Request, { params }: { params: { tenant: string } }) {
  const session = await getServerSession(authOptions)
  const isEditor = (session?.user as { role?: string })?.role === 'editor'
  if (!isEditor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { tenant } = params

  const blob = await put(`${tenant}/tokens/tokens-${Date.now()}.json`, JSON.stringify(body), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  })

  return NextResponse.json({ ok: true, url: blob.url })
}
