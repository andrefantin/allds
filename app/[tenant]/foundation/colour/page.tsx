import { getTokens } from '@/lib/tokens.server'
import { ColourSwatch } from '@/components/foundation/ColourSwatch'
import { ModesTabs } from '@/components/foundation/ModesTabs'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Colour' }

interface Props { params: { tenant: string } }

export default async function ColourPage({ params }: Props) {
  const tokens = await getTokens(params.tenant)

  const colorCollections = tokens.collections.filter((c) =>
    c.tokens.some((t) => t.type === 'color')
  )

  return (
    <div className="p-8 max-w-[96rem] mx-auto">
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
                  <ModesTabs modes={collection.modes}>
                    {(activeMode: string) => (
                      <div className="card overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-fics-border bg-fics-bg">
                              <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted w-12">Swatch</th>
                              <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">Token</th>
                              <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {colorTokens.map((token, i) => {
                              const value = token.values[activeMode] || Object.values(token.values)[0]
                              return (
                                <tr key={token.name} className={`border-b border-fics-border ${i % 2 === 1 ? 'bg-fics-bg/30' : ''}`}>
                                  <td className="px-6 py-3 align-middle">
                                    <ColourSwatch color={value} compact />
                                  </td>
                                  <td className="px-6 py-3 align-middle font-mono text-[1.3rem] text-fics-text">{token.name}</td>
                                  <td className="px-6 py-3 align-middle font-mono text-[1.2rem] text-fics-text-muted">{value}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </ModesTabs>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {colorTokens.map((token) => {
                      const value = Object.values(token.values)[0]
                      return (
                        <div key={token.name}>
                          <ColourSwatch color={value} name={token.name} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
