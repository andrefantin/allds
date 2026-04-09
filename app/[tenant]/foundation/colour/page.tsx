import { getTokens } from '@/lib/tokens.server'
import { ColourSwatch } from '@/components/foundation/ColourSwatch'
import { ModesTabs } from '@/components/foundation/ModesTabs'
import type { Token } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Colour' }

interface Props { params: { tenant: string } }

function ColourTable({ colorTokens, mode }: { colorTokens: Token[]; mode: string }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-fics-border bg-fics-bg">
              <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted w-12"></th>
              <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">Token</th>
              <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">Reference</th>
            </tr>
          </thead>
          <tbody>
            {colorTokens.map((token, i) => {
              const value = token.values[mode] || Object.values(token.values)[0]
              const alias = token.aliases?.[mode] || (token.aliases ? Object.values(token.aliases)[0] : undefined)
              return (
                <tr key={token.name} className={`border-b border-fics-border last:border-0 ${i % 2 === 1 ? 'bg-fics-bg/30' : ''}`}>
                  <td className="px-6 py-3 align-middle">
                    <ColourSwatch color={value} compact />
                  </td>
                  <td className="px-6 py-3 align-middle font-mono text-[1.3rem] text-fics-text">{token.name}</td>
                  <td className="px-6 py-3 align-middle">
                    {alias ? (
                      <div>
                        <span className="font-mono text-[1.3rem] text-fics-heading">{alias}</span>
                        <span className="font-mono text-[1.1rem] text-fics-text-muted block">{value}</span>
                      </div>
                    ) : (
                      <span className="font-mono text-[1.2rem] text-fics-text-muted">{value}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function ColourPage({ params }: Props) {
  const tokens = await getTokens(params.tenant)

  const colorCollections = tokens.collections.filter((c) =>
    c.tokens.some((t) => t.type === 'color')
  )

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-heading mb-1">Foundation</p>
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">Colour</h1>
        <p className="text-body text-fics-text-muted max-w-[60rem]">
          Colour tokens and swatches from your token file.
        </p>
      </div>

      {colorCollections.length === 0 ? (
        <div className="card p-8 text-fics-text-muted text-[1.3rem]">
          No colour tokens found. Upload a token file containing color tokens to populate this page.
        </div>
      ) : (
        <div className="space-y-8">
          {colorCollections.map((collection) => {
            const colorTokens = collection.tokens.filter((t) => t.type === 'color')
            const isMultiMode = collection.modes.length > 1

            return (
              <div key={collection.name}>
                <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted mb-4">
                  {collection.name.replace(/^[_✅\s]+/, '')}
                </h2>
                {isMultiMode ? (
                  <ModesTabs
                    modes={collection.modes}
                    panels={collection.modes.map((mode) => (
                      <ColourTable key={mode} colorTokens={colorTokens} mode={mode} />
                    ))}
                  />
                ) : (
                  <ColourTable colorTokens={colorTokens} mode={collection.modes[0] || ''} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
