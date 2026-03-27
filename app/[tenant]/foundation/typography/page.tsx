import { getTokens } from '@/lib/tokens.server'
import { getFigmaFoundationData } from '@/lib/figma-foundation.server'
import { TypographyTokenTable } from '@/components/foundation/TypographyTokenTable'
import Link from 'next/link'
import type { Token } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Typography' }

const WEIGHT_NAMES: Record<number, string> = {
  100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular',
  500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black',
}

function findTokenForSize(tokens: Token[], pxSize: number): string | null {
  const remValue = `${pxSize / 10}rem`
  const remValueFixed = `${(pxSize / 10).toFixed(1)}rem`
  for (const t of tokens) {
    const v = Object.values(t.values)[0] || ''
    if (v === remValue || v === remValueFixed || v === `${pxSize}px`) return t.name
  }
  return null
}

interface Props { params: { tenant: string } }

export default async function TypographyPage({ params }: Props) {
  const { tenant } = params
  const [tokens, foundation] = await Promise.all([getTokens(tenant), getFigmaFoundationData(tenant)])

  const fontTokens: Token[] = tokens.collections.flatMap((c) =>
    c.tokens.filter((t) => t.type === 'dimension')
  )

  const { textStyles } = foundation
  const grouped: Record<string, typeof textStyles> = {}
  for (const style of textStyles) {
    if (!grouped[style.category]) grouped[style.category] = []
    grouped[style.category].push(style)
  }

  const typographyCollections = tokens.collections
    .filter((c) => c.name === '_Typography primitives' || c.name === 'Device')
    .map((c) => ({ ...c, tokens: c.tokens.filter((t) => !t.name.toLowerCase().includes('container')) }))
    .filter((c) => c.tokens.length > 0)

  return (
    <div className="p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-heading mb-1">Foundation</p>
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">Typography</h1>
        <p className="text-body text-fics-text-muted max-w-[60rem]">Text styles from Figma and the tokens that define them.</p>
      </div>

      {textStyles.length > 0 ? (
        <div className="space-y-10 mb-12">
          {Object.entries(grouped).map(([category, styles]) => (
            <div key={category}>
              <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted mb-4">{category}</h2>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-fics-border bg-fics-bg">
                      <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted w-[22rem]">Style</th>
                      <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted w-[18rem]">Properties</th>
                      <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">Token</th>
                      <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {styles.map((style, i) => {
                      const token = findTokenForSize(fontTokens, style.fontSize)
                      const displayName = style.name.includes('/') ? style.name.split('/').slice(1).join('/') : style.name
                      return (
                        <tr key={style.id} className={`border-b border-fics-border ${i % 2 === 1 ? 'bg-fics-bg/30' : ''}`}>
                          <td className="px-6 py-4 align-middle">
                            <div className="font-mono text-[1.3rem] text-fics-text font-medium">{displayName}</div>
                            <div className="text-[1.1rem] text-fics-text-muted">{style.fontFamily}</div>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="space-y-0.5">
                              <div className="font-mono text-[1.2rem] text-fics-text">{style.fontSize}px · {WEIGHT_NAMES[style.fontWeight] || style.fontWeight}</div>
                              {style.lineHeightPx > 0 && <div className="font-mono text-[1.1rem] text-fics-text-muted">Line height {style.lineHeightPx}px</div>}
                              {style.letterSpacingPx !== 0 && <div className="font-mono text-[1.1rem] text-fics-text-muted">Letter spacing {style.letterSpacingPx > 0 ? '+' : ''}{style.letterSpacingPx}px</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            {token ? (
                              <span className="font-mono text-[1.2rem] bg-fics-bg px-2 py-0.5 rounded text-fics-heading border border-fics-border">{token}</span>
                            ) : (
                              <span className="text-[1.2rem] text-fics-text-muted/50">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div
                              style={{ fontFamily: style.fontFamily || 'inherit', fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeightPx > 0 ? `${style.lineHeightPx}px` : 1.2, letterSpacing: style.letterSpacingPx !== 0 ? `${style.letterSpacingPx}px` : undefined, textTransform: style.textCase === 'UPPER' ? 'uppercase' : style.textCase === 'LOWER' ? 'lowercase' : undefined }}
                              className="text-fics-text truncate max-w-[28rem]"
                            >
                              The quick brown fox
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 flex items-start gap-4 mb-10 bg-fics-bg/50">
          <div>
            <p className="text-[1.3rem] font-medium text-fics-text">No text styles synced yet</p>
            <p className="text-[1.2rem] text-fics-text-muted mt-0.5">
              Add your Foundation Figma File ID in{' '}
              <Link href={`/${tenant}/settings`} className="text-fics-heading hover:underline">Settings</Link>
              {' '}and click <strong>Sync Foundation</strong>.
            </p>
          </div>
        </div>
      )}

      {typographyCollections.map((collection) => (
        <div key={collection.name} className="mb-8">
          <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted mb-4">
            {collection.name.replace(/^[_✅\s]+/, '')}
          </h2>
          <TypographyTokenTable collection={collection} />
        </div>
      ))}
    </div>
  )
}
