import { NextResponse } from 'next/server'
import { getTokenHistory } from '@/lib/tokens.server'

export async function GET(_req: Request, { params }: { params: { tenant: string } }) {
  const history = await getTokenHistory(params.tenant)
  return NextResponse.json(history)
}
