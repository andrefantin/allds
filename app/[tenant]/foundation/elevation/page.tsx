import { getFigmaFoundationData } from '@/lib/figma-foundation.server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Elevation' }

interface Props { params: { tenant: string } }

export default async function ElevationPage({ params }: Props) {
  const { tenant } = params
  const foundation = await getFigmaFoundationData(tenant)
  const { effectStyles } = foundation

  const grouped: Record<string, typeof effectStyles> = {}
  for (const style of effectStyles) {
    if (!grouped[style.category]) grouped[style.category] = []
    grouped[style.category].push(style)
  }

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-heading mb-1">Foundation</p>
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">Elevation</h1>
        <p className="text-body text-fics-text-muted max-w-[60rem]">Shadow styles from Figma effect styles.</p>
      </div>
      {effectStyles.length === 0 ? (
        <div className="card p-8 flex items-start gap-4 bg-fics-bg/50">
          <div>
            <p className="text-[1.3rem] font-medium text-fics-text">No elevation styles synced yet</p>
            <p className="text-[1.2rem] text-fics-text-muted mt-0.5">
              Add your Foundation Figma File ID in{' '}
              <Link href={`/${tenant}/settings`} className="text-fics-heading hover:underline">Settings</Link>
              {' '}and click <strong>Sync Foundation</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, styles]) => (
            <div key={category}>
              {Object.keys(grouped).length > 1 && (
                <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted mb-4">{category}</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {styles.map((style) => (
                  <div key={style.id} className="card p-6 flex flex-col gap-4">
                    <div className="h-16 rounded-lg bg-white" style={{ boxShadow: style.cssBoxShadow }} />
                    <div>
                      <div className="font-mono text-[1.2rem] text-fics-text font-medium">
                        {style.name.includes('/') ? style.name.split('/').slice(1).join('/') : style.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-fics-border bg-fics-bg">
                      <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">Style</th>
                      <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">CSS box-shadow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {styles.map((style, i) => (
                      <tr key={style.id} className={`border-b border-fics-border ${i % 2 === 1 ? 'bg-fics-bg/30' : ''}`}>
                        <td className="px-6 py-3 font-mono text-[1.3rem] text-fics-text">
                          {style.name.includes('/') ? style.name.split('/').slice(1).join('/') : style.name}
                        </td>
                        <td className="px-6 py-3 font-mono text-[1.1rem] text-fics-text-muted break-all">{style.cssBoxShadow}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
