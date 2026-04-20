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
  const widthTokens = borderTokens.filter((t) => {
    const name = t.name.toLowerCase()
    return !name.includes('radius') && (name.includes('width') || name.includes('size') || name.includes('stroke'))
  })

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-ds-heading mb-1">Foundation</p>
        <h1 className="text-heading-lg font-bold text-ds-text mb-2">Border & Radius</h1>
        <p className="text-body text-ds-text-muted max-w-[60rem]">Border radius and width tokens.</p>
      </div>

      {borderTokens.length === 0 ? (
        <div className="card p-8 text-ds-text-muted text-[1.3rem]">
          No border tokens found. Upload a token file containing border tokens to populate this page.
        </div>
      ) : (
        <div className="space-y-8">
          {radiusTokens.length > 0 && (
            <div>
              <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-ds-text-muted mb-4">Border Radius</h2>
              <div className="card p-6 space-y-4">
                {radiusTokens.map((token) => {
                  const value = Object.values(token.values)[0]
                  const px = remToPixels(value)
                  return (
                    <div key={token.name} className="flex items-center gap-4 md:gap-6">
                      <div className="w-36 md:w-56 shrink-0">
                        <div className="font-mono text-[1.3rem] text-ds-text">{token.name}</div>
                        <div className="text-[1.2rem] text-ds-text-muted">{value} · {px}px</div>
                      </div>
                      <div className="w-12 h-12 bg-ds-heading/20 border-2 border-ds-heading/40" style={{ borderRadius: value }} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {widthTokens.length > 0 && (
            <div>
              <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-ds-text-muted mb-4">Border Width</h2>
              <div className="card p-6 space-y-4">
                {widthTokens.map((token) => {
                  const value = Object.values(token.values)[0]
                  const px = remToPixels(value)
                  return (
                    <div key={token.name} className="flex items-center gap-4 md:gap-6">
                      <div className="w-36 md:w-56 shrink-0">
                        <div className="font-mono text-[1.3rem] text-ds-text">{token.name}</div>
                        <div className="text-[1.2rem] text-ds-text-muted">{value} · {px}px</div>
                      </div>
                      <div className="flex-1 bg-ds-heading/70" style={{ height: Math.max(px, 1) }} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
