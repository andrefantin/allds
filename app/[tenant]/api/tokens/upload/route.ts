import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function POST(req: Request, { params }: { params: { tenant: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role
  const isEditor = role === 'editor' || role === 'platform_editor'
  if (!isEditor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { tenant } = params

  const timestamp = Date.now()
  const [blob] = await Promise.all([
    put(`${tenant}/tokens/tokens-${timestamp}.json`, JSON.stringify(body), {
      access: 'public', contentType: 'application/json', addRandomSuffix: false,
    }),
    put(`${tenant}/tokens/current.json`, JSON.stringify(body), {
      access: 'public', contentType: 'application/json', addRandomSuffix: false,
    }),
  ])

  return NextResponse.json({ ok: true, url: blob.url })
}
