import { getTokens } from '@/lib/tokens.server'
import { remToPixels } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Border & Radius' }

interface Props { params: { tenant: string } }

export default async function BorderPage({ params }: Props) {
  const tokens = await getTokens(params.tenant)
  const borderCollection = tokens.collections.find((c) => c.name === 'Border' || c.name === 'border')
  const borderTokens = borderCollection ? borderCollection.tokens : []

  const radiusTokens = borderTokens.filter((t) => t.name.toLowerCase().includes('radius'))
  const widthTokens = borderTokens.filter((t) => t.name.toLowerCase().includes('width') || t.name.toLowerCase().includes('border-'))
  const otherTokens = borderTokens.filter((t) => !radiusTokens.includes(t) && !widthTokens.includes(t))

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-heading mb-1">Foundation</p>
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">Border & Radius</h1>
        <p className="text-body text-fics-text-muted max-w-[60rem]">Border radius and width tokens.</p>
      </div>

      {borderTokens.length === 0 ? (
        <div className="card p-8 text-fics-text-muted text-[1.3rem]">
          No border tokens found. Upload a token file containing border tokens to populate this page.
        </div>
      ) : (
        <div className="space-y-8">
          {radiusTokens.length > 0 && (
            <div>
              <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted mb-4">Border Radius</h2>
              <div className="card p-6 space-y-4">
                {radiusTokens.map((token) => {
                  const value = Object.values(token.values)[0]
                  const px = remToPixels(value)
                  return (
                    <div key={token.name} className="flex items-center gap-4 md:gap-6">
                      <div className="w-36 md:w-56 shrink-0">
                        <div className="font-mono text-[1.3rem] text-fics-text">{token.name}</div>
                        <div className="text-[1.2rem] text-fics-text-muted">{value} · {px}px</div>
                      </div>
                      <div className="w-12 h-12 bg-fics-heading/20 border-2 border-fics-heading/40" style={{ borderRadius: value }} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {widthTokens.length > 0 && (
            <div>
              <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted mb-4">Border Width</h2>
              <div className="card p-6 space-y-4">
                {widthTokens.map((token) => {
                  const value = Object.values(token.values)[0]
                  const px = remToPixels(value)
                  return (
                    <div key={token.name} className="flex items-center gap-4 md:gap-6">
                      <div className="w-36 md:w-56 shrink-0">
                        <div className="font-mono text-[1.3rem] text-fics-text">{token.name}</div>
                        <div className="text-[1.2rem] text-fics-text-muted">{value} · {px}px</div>
                      </div>
                      <div className="flex-1 bg-fics-heading/70" style={{ height: Math.max(px, 1) }} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {otherTokens.length > 0 && (
            <div>
              <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted mb-4">Other</h2>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-fics-border bg-fics-bg">
                      <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">Token</th>
                      <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherTokens.map((token, i) => (
                      <tr key={token.name} className={`border-b border-fics-border ${i % 2 === 1 ? 'bg-fics-bg/30' : ''}`}>
                        <td className="px-6 py-3 font-mono text-[1.3rem] text-fics-text">{token.name}</td>
                        <td className="px-6 py-3 font-mono text-[1.2rem] text-fics-text-muted">{Object.values(token.values)[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
