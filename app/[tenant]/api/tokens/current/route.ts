import { NextResponse } from 'next/server'
import { getTokens } from '@/lib/tokens.server'

export async function GET(_req: Request, { params }: { params: { tenant: string } }) {
  const tokens = await getTokens(params.tenant)
  return NextResponse.json(tokens)
}
