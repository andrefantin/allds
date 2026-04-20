import type { Metadata } from 'next'
import { getTokens } from '@/lib/tokens.server'
import { ColourAccessibilityChecker } from '@/components/foundation/ColourAccessibilityChecker'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Colour Accessibility' }

export default async function ColourAccessibilityPage({ params }: { params: { tenant: string } }) {
  const tokens = await getTokens(params.tenant)
  // Exclude primitive/internal collections — users should only work with semantic design tokens
  const colorCollections = tokens.collections.filter((c) => {
    const lname = c.name.toLowerCase()
    if (c.name.startsWith('_')) return false
    if (lname.includes('primitive')) return false
    return c.tokens.some((t) => t.type === 'color')
  })

  return <ColourAccessibilityChecker collections={colorCollections} />
}
