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
    <div className="p-8 max-w-[96rem] mx-auto">
      <nav className="flex items-center gap-2 text-[1.3rem] text-fics-text-muted mb-6">
        <Link href={`/${tenant}/components`} className="hover:text-fics-text transition-colors">Components</Link>
        <span>/</span>
        <span className="text-fics-text font-medium">{component.name}</span>
      </nav>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-heading-lg font-bold text-fics-text">{component.name}</h1>
              <StatusBadge status={component.status} size="md" />
            </div>
            <ComponentMeta component={component} />
          </div>
          <div className="card overflow-hidden">
            <div className="px-6 py-3 border-b border-fics-border flex items-center justify-between">
              <h2 className="text-[1.4rem] font-semibold text-fics-text">Preview</h2>
              {component.figmaUrl && (
                <a href={component.figmaUrl} target="_blank" rel="noopener noreferrer"
                  className="text-[1.2rem] text-fics-heading hover:underline flex items-center gap-1">
                  Open in Figma
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
            <div className="p-6">
              <ComponentPreview figmaFileId={fileId} nodeId={component.id} thumbnailUrl={component.thumbnailUrl} name={component.name} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-[1.3rem] font-semibold text-fics-text mb-3">Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-[1.2rem] text-fics-text-muted">Group</dt>
                <dd className="text-[1.3rem] font-medium text-fics-text">{component.group}</dd>
              </div>
              <div>
                <dt className="text-[1.2rem] text-fics-text-muted">Status</dt>
                <dd><StatusBadge status={component.status} /></dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
