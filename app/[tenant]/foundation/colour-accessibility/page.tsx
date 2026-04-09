import type { Metadata } from 'next'
import { getTokens } from '@/lib/tokens.server'
import { ColourAccessibilityChecker } from '@/components/foundation/ColourAccessibilityChecker'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Colour Accessibility' }

export default async function ColourAccessibilityPage({ params }: { params: { tenant: string } }) {
  const tokens = await getTokens(params.tenant)
  const colorCollections = tokens.collections.filter((c) =>
    c.tokens.some((t) => t.type === 'color')
  )

  return <ColourAccessibilityChecker collections={colorCollections} />
}
