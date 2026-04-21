import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ComponentPreview } from '@/components/figma/ComponentPreview'
import { ComponentMeta } from '@/components/figma/ComponentMeta'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getFigmaData } from '@/lib/figma-data.server'
import { getSettings } from '@/lib/settings.server'

export const dynamic = 'force-dynamic'

interface Props { params: { tenant: string; slug: string } }

export default async function ComponentDetailPage({ params }: Props) {
  const { tenant, slug } = params
  const [figmaData, settings] = await Promise.all([getFigmaData(tenant), getSettings(tenant)])

  const component = figmaData.components.find((c) => c.slug === slug)
  if (!component) notFound()

  const fileId = settings.figmaFileComponents

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[1.3rem] text-ds-text-muted mb-6">
        <Link href={`/${tenant}/components`} className="hover:text-ds-text transition-colors">Components</Link>
        <span>/</span>
        <span className="text-ds-text font-medium">{component.name}</span>
      </nav>

      {/* Title row */}
      <div className="flex items-start gap-3 mb-1">
        <h1 className="text-heading-lg font-bold text-ds-text">{component.name}</h1>
        <span className="mt-1.5"><StatusBadge status={component.status} size="md" /></span>
      </div>
      <p className="text-[1.3rem] text-ds-text-muted mb-8">{component.group}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ComponentMeta component={component} explorePath={`/${tenant}/playground?slug=${component.slug}&type=components`} />
          <div className="card overflow-hidden">
            <div className="px-6 py-3 border-b border-ds-border">
              <h2 className="text-[1.4rem] font-semibold text-ds-text">Preview</h2>
            </div>
            <div className="p-6">
              <ComponentPreview figmaFileId={fileId} nodeId={component.id} thumbnailUrl={component.thumbnailUrl} name={component.name} />
            </div>
          </div>
          {component.description && (
            <div className="card p-6">
              <h2 className="text-heading-sm font-semibold text-ds-text mb-3">Usage</h2>
              <p className="text-body text-ds-text-muted">{component.description}</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-[1.3rem] font-semibold text-ds-text mb-3">Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-[1.2rem] text-ds-text-muted">Group</dt>
                <dd className="text-[1.3rem] font-medium text-ds-text">{component.group}</dd>
              </div>
              <div>
                <dt className="text-[1.2rem] text-ds-text-muted">Status</dt>
                <dd className="mt-0.5"><StatusBadge status={component.status} /></dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
