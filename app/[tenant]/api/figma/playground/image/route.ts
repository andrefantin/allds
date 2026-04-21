import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSettings } from '@/lib/settings.server'

const FIGMA_API_BASE = 'https://api.figma.com/v1'

export async function GET(req: Request, { params }: { params: { tenant: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const nodeId = searchParams.get('nodeId')
  const fileId = searchParams.get('fileId')
  if (!nodeId || !fileId) {
    return NextResponse.json({ error: 'nodeId and fileId required' }, { status: 400 })
  }

  const settings = await getSettings(params.tenant)
  const token = settings.figmaToken
  if (!token) return NextResponse.json({ error: 'Figma not configured' }, { status: 400 })

  const res = await fetch(
    `${FIGMA_API_BASE}/images/${fileId}?ids=${encodeURIComponent(nodeId)}&scale=2&format=png`,
    { headers: { 'X-Figma-Token': token }, cache: 'no-store' }
  )
  if (!res.ok) {
    return NextResponse.json({ error: `Figma API error: ${res.status}` }, { status: res.status })
  }

  const data = await res.json()
  const normalizedId = nodeId.replace(/-/g, ':')
  const imageUrl = data.images?.[normalizedId] || data.images?.[nodeId] || null

  if (!imageUrl) return NextResponse.json({ error: 'Image not found' }, { status: 404 })

  return NextResponse.json({ imageUrl })
}
