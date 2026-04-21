import Link from 'next/link'
import { getFigmaData } from '@/lib/figma-data.server'
import { StatusBadge } from '@/components/ui/StatusBadge'

export const dynamic = 'force-dynamic'

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins} minutes ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`
  return new Date(dateStr).toLocaleDateString()
}

interface Props { params: { tenant: string } }

export default async function TenantHomePage({ params }: Props) {
  const { tenant } = params
  const figmaData = await getFigmaData(tenant)

  const totalComponents = figmaData.components.length
  const totalModules = figmaData.modules.length
  const recentComponents = figmaData.components.slice(0, 6)

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-ds-text mb-2">Welcome</h1>
        <p className="text-body text-ds-text-muted max-w-[60rem]">
          Your design system documentation — components, tokens, and guidelines in one place.
        </p>
        {figmaData.lastSynced && (
          <p className="text-[1.2rem] text-ds-text-muted/70 mt-1">
            Last synced {relativeTime(figmaData.lastSynced)}
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link href={`/${tenant}/components`} className="card p-6 hover:shadow-md transition-shadow">
          <div className="text-[3rem] font-bold text-ds-heading mb-1">{totalComponents}</div>
          <div className="text-body text-ds-text-muted">Components</div>
        </Link>
        <Link href={`/${tenant}/modules`} className="card p-6 hover:shadow-md transition-shadow">
          <div className="text-[3rem] font-bold text-ds-heading mb-1">{totalModules}</div>
          <div className="text-body text-ds-text-muted">Modules</div>
        </Link>
        <Link href={`/${tenant}/libraries`} className="card p-6 hover:shadow-md transition-shadow">
          <div className="text-[3rem] font-bold text-ds-heading mb-1">
            {figmaData.additionalLibraries.length + 3}
          </div>
          <div className="text-body text-ds-text-muted">Libraries</div>
        </Link>
      </div>

      {/* Recently added components */}
      {recentComponents.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-heading-sm font-semibold text-ds-text">Recently added</h2>
            <Link href={`/${tenant}/components`} className="text-[1.2rem] text-ds-heading hover:underline">See all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentComponents.map((comp) => (
              <Link key={comp.slug} href={`/${tenant}/components/${comp.slug}`}
                className="card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="font-medium text-ds-text text-[1.2rem] leading-snug">{comp.name}</div>
                  <StatusBadge status={comp.status} size="sm" />
                </div>
                <div className="text-[1.1rem] text-ds-text-muted truncate">{comp.group}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Foundation + Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-heading-sm font-semibold text-ds-text mb-4">Foundation</h2>
          <div className="space-y-2">
            {['colour', 'typography', 'spacing', 'border', 'elevation', 'icons', 'tokens'].map((item) => (
              <Link key={item} href={`/${tenant}/foundation/${item}`}
                className="flex items-center gap-2 text-[1.3rem] text-ds-text-muted hover:text-ds-heading transition-colors capitalize">
                <span className="text-ds-heading/40">→</span> {item.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-heading-sm font-semibold text-ds-text mb-4">Quick links</h2>
          <div className="space-y-2">
            <Link href={`/${tenant}/components`} className="flex items-center gap-2 text-[1.3rem] text-ds-text-muted hover:text-ds-heading transition-colors">
              <span className="text-ds-heading/40">→</span> All components
            </Link>
            <Link href={`/${tenant}/modules`} className="flex items-center gap-2 text-[1.3rem] text-ds-text-muted hover:text-ds-heading transition-colors">
              <span className="text-ds-heading/40">→</span> All modules
            </Link>
            <Link href={`/${tenant}/libraries`} className="flex items-center gap-2 text-[1.3rem] text-ds-text-muted hover:text-ds-heading transition-colors">
              <span className="text-ds-heading/40">→</span> All libraries
            </Link>
            <Link href={`/${tenant}/settings`} className="flex items-center gap-2 text-[1.3rem] text-ds-text-muted hover:text-ds-heading transition-colors">
              <span className="text-ds-heading/40">→</span> Settings & sync
            </Link>
            <Link href="/admin" className="flex items-center gap-2 text-[1.3rem] text-ds-text-muted hover:text-ds-heading transition-colors">
              <span className="text-ds-heading/40">→</span> All design systems
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
