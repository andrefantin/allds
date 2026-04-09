import Link from 'next/link'
import { getFigmaData } from '@/lib/figma-data.server'

export const dynamic = 'force-dynamic'

interface Props { params: { tenant: string } }

export default async function TenantHomePage({ params }: Props) {
  const { tenant } = params
  const figmaData = await getFigmaData(tenant)

  const totalComponents = figmaData.components.length
  const totalModules = figmaData.modules.length

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">Welcome</h1>
        <p className="text-body text-fics-text-muted max-w-[60rem]">
          Your design system documentation — components, tokens, and guidelines in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link href={`/${tenant}/components`} className="card p-6 hover:shadow-md transition-shadow">
          <div className="text-[3rem] font-bold text-fics-heading mb-1">{totalComponents}</div>
          <div className="text-body text-fics-text-muted">Components</div>
        </Link>
        <Link href={`/${tenant}/modules`} className="card p-6 hover:shadow-md transition-shadow">
          <div className="text-[3rem] font-bold text-fics-heading mb-1">{totalModules}</div>
          <div className="text-body text-fics-text-muted">Modules</div>
        </Link>
        <Link href={`/${tenant}/foundation/tokens`} className="card p-6 hover:shadow-md transition-shadow">
          <div className="text-[3rem] font-bold text-fics-heading mb-1">
            {figmaData.lastSynced ? '✓' : '—'}
          </div>
          <div className="text-body text-fics-text-muted">Synced from Figma</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-heading-sm font-semibold text-fics-text mb-4">Foundation</h2>
          <div className="space-y-2">
            {['colour', 'typography', 'spacing', 'border', 'elevation', 'icons', 'tokens'].map((item) => (
              <Link key={item} href={`/${tenant}/foundation/${item}`}
                className="flex items-center gap-2 text-[1.3rem] text-fics-text-muted hover:text-fics-heading transition-colors capitalize">
                <span className="text-fics-heading/40">→</span> {item.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-heading-sm font-semibold text-fics-text mb-4">Quick links</h2>
          <div className="space-y-2">
            <Link href={`/${tenant}/components`} className="flex items-center gap-2 text-[1.3rem] text-fics-text-muted hover:text-fics-heading transition-colors">
              <span className="text-fics-heading/40">→</span> All components
            </Link>
            <Link href={`/${tenant}/modules`} className="flex items-center gap-2 text-[1.3rem] text-fics-text-muted hover:text-fics-heading transition-colors">
              <span className="text-fics-heading/40">→</span> All modules
            </Link>
            <Link href={`/${tenant}/settings`} className="flex items-center gap-2 text-[1.3rem] text-fics-text-muted hover:text-fics-heading transition-colors">
              <span className="text-fics-heading/40">→</span> Settings & sync
            </Link>
            <Link href="/admin" className="flex items-center gap-2 text-[1.3rem] text-fics-text-muted hover:text-fics-heading transition-colors">
              <span className="text-fics-heading/40">→</span> All design systems
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
