import { getTokens } from '@/lib/tokens.server'
import { ColourCollectionView } from '@/components/foundation/ColourCollectionView'
import { ModesTabs } from '@/components/foundation/ModesTabs'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Colour' }

interface Props { params: { tenant: string } }

export default async function ColourPage({ params }: Props) {
  const tokens = await getTokens(params.tenant)

  const colorCollections = tokens.collections.filter((c) =>
    c.tokens.some((t) => t.type === 'color')
  )

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-ds-heading mb-1">Foundation</p>
        <h1 className="text-heading-lg font-bold text-ds-text mb-2">Colour</h1>
        <p className="text-body text-ds-text-muted max-w-[60rem]">
          Colour tokens and swatches from your token file.
        </p>
      </div>

      {colorCollections.length === 0 ? (
        <div className="card p-8">
          <p className="text-[1.4rem] font-medium text-ds-text mb-4">No colour tokens found</p>
          <ol className="space-y-2 text-[1.3rem] text-ds-text-muted list-none">
            <li><span className="font-mono text-ds-heading mr-2">1.</span>Go to <Link href={`/${params.tenant}/foundation/tokens`} className="text-ds-heading hover:underline">Design Tokens</Link> and upload your token JSON file</li>
            <li><span className="font-mono text-ds-heading mr-2">2.</span>Ensure your tokens include <strong className="text-ds-text">color</strong> type entries</li>
            <li><span className="font-mono text-ds-heading mr-2">3.</span>Come back here — swatches will appear automatically</li>
          </ol>
        </div>
      ) : (
        <div className="space-y-8">
          {colorCollections.map((collection) => {
            const colorTokens = collection.tokens.filter((t) => t.type === 'color')
            const isMultiMode = collection.modes.length > 1

            return (
              <div key={collection.name}>
                <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-ds-text-muted mb-4">
                  {collection.name.replace(/^[_✅\s]+/, '')}
                </h2>
                {isMultiMode ? (
                  <ModesTabs
                    modes={collection.modes}
                    panels={collection.modes.map((mode) => (
                      <ColourCollectionView key={mode} colorTokens={colorTokens} mode={mode} />
                    ))}
                  />
                ) : (
                  <ColourCollectionView colorTokens={colorTokens} mode={collection.modes[0] || ''} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
