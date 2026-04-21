import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSettings } from '@/lib/settings.server'

const FIGMA_API_BASE = 'https://api.figma.com/v1'

export async function GET(req: Request, { params }: { params: { tenant: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const componentId = searchParams.get('componentId')
  if (!componentId) return NextResponse.json({ error: 'componentId required' }, { status: 400 })

  const settings = await getSettings(params.tenant)
  const token = settings.figmaToken
  const fileId = settings.figmaFileComponents
  if (!token || !fileId) {
    return NextResponse.json({ error: 'Figma not configured' }, { status: 400 })
  }

  const nodeId = componentId.replace(/-/g, ':')

  const res = await fetch(
    `${FIGMA_API_BASE}/files/${fileId}/nodes?ids=${encodeURIComponent(nodeId)}&depth=2`,
    { headers: { 'X-Figma-Token': token }, cache: 'no-store' }
  )
  if (!res.ok) {
    return NextResponse.json({ error: `Figma API error: ${res.status}` }, { status: res.status })
  }

  const data = await res.json()
  const nodeEntry = data.nodes?.[nodeId]
  if (!nodeEntry) return NextResponse.json({ error: 'Node not found' }, { status: 404 })

  const doc = nodeEntry.document as Record<string, unknown>

  // Parse componentPropertyDefinitions → property list with options
  type PropDef = { type: string; variantOptions?: string[]; defaultValue?: string }
  const propDefs = (doc.componentPropertyDefinitions || {}) as Record<string, PropDef>

  const properties = Object.entries(propDefs).map(([name, def]) => ({
    name,
    type: def.type as string,
    values: def.variantOptions || [],
    defaultValue: def.defaultValue,
  }))

  // Parse child COMPONENT nodes → variants with their property combos
  interface Variant { nodeId: string; props: Record<string, string> }
  const variants: Variant[] = []

  const children = (doc.children || []) as Record<string, unknown>[]
  for (const child of children) {
    if (child.type !== 'COMPONENT') continue
    const name = (child.name as string) || ''
    // Name looks like: "Size=Large, State=Default, Type=Primary"
    const props: Record<string, string> = {}
    name.split(',').forEach((pair) => {
      const [k, v] = pair.trim().split('=')
      if (k && v !== undefined) props[k.trim()] = v.trim()
    })
    variants.push({ nodeId: child.id as string, props })
  }

  return NextResponse.json({ fileId, properties, variants })
}
