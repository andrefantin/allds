import { getTokens } from '@/lib/tokens.server'
import { SpacingTable } from '@/components/foundation/SpacingTable'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Spacing' }

interface Props { params: { tenant: string } }

export default async function SpacingPage({ params }: Props) {
  const tokens = await getTokens(params.tenant)

  const spacingCollection = tokens.collections.find((c) => c.name === 'Spacing' || c.name === 'spacing')
  const deviceCollection = tokens.collections.find((c) => c.name === 'Device')
  const collection = spacingCollection || deviceCollection
  const spacingTokens = collection ? collection.tokens.filter((t) => t.type === 'dimension') : []

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-heading mb-1">Foundation</p>
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">Spacing</h1>
        <p className="text-body text-fics-text-muted max-w-[60rem]">
          Spacing and dimension tokens used across layouts, components, and breakpoints.
        </p>
      </div>
      {spacingTokens.length === 0 || !collection ? (
        <div className="card p-8 text-fics-text-muted text-[1.3rem]">
          No spacing tokens found. Upload a token file to populate this page.
        </div>
      ) : (
        <SpacingTable collection={collection} tokens={spacingTokens} />
      )}
    </div>
  )
}
