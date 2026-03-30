import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ComponentPreview } from '@/components/figma/ComponentPreview'
import { ComponentMeta } from '@/components/figma/ComponentMeta'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getFigmaData } from '@/lib/figma-data.server'
import { getSettings } from '@/lib/settings.server'
import { fetchComponentsUsedInModule } from '@/lib/figma'
import type { FigmaComponent, ComponentStatus, NavigationItem } from '@/types'

export const dynamic = 'force-dynamic'

interface Props { params: { tenant: string; slug: string } }

export default async function ModuleDetailPage({ params }: Props) {
  const { tenant, slug } = params
  const [figmaData, settings] = await Promise.all([getFigmaData(tenant), getSettings(tenant)])

  function buildModuleFromNav(s: string): FigmaComponent | null {
    for (const group of figmaData.navigation.modules) {
      const item = group.items.find((i: NavigationItem) => i.slug === s)
      if (item) {
        return { id: s, key: s, name: item.name, slug: item.slug, description: `${item.name} module.`, status: item.status as ComponentStatus, group: group.group, fileType: 'modules' }
      }
    }
    return null
  }

  const module = figmaData.modules.find((m) => m.slug === slug) || buildModuleFromNav(slug)
  if (!module) notFound()

  const fileId = settings.figmaFileModules
  if (settings.figmaToken) process.env.FIGMA_ACCESS_TOKEN = settings.figmaToken
  const usedComponents = fileId && module.id
    ? await fetchComponentsUsedInModule(fileId, module.id, figmaData.components)
    : []

  return (
    <div className="p-8 max-w-[96rem] mx-auto">
      <nav className="flex items-center gap-2 text-[1.3rem] text-fics-text-muted mb-6">
        <Link href={`/${tenant}/modules`} className="hover:text-fics-text transition-colors">Modules</Link>
        <span>/</span>
        <span className="text-fics-text font-medium">{module.name}</span>
      </nav>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-heading-lg font-bold text-fics-text">{module.name}</h1>
            </div>
            <ComponentMeta component={module} />
          </div>
          <div className="card overflow-hidden">
            <div className="px-6 py-3 border-b border-fics-border flex items-center justify-between">
              <h2 className="text-[1.4rem] font-semibold text-fics-text">Preview</h2>
              {module.figmaUrl && (
                <a href={module.figmaUrl} target="_blank" rel="noopener noreferrer"
                  className="text-[1.2rem] text-fics-heading hover:underline flex items-center gap-1">
                  Open in Figma
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
            <div className="p-6">
              <ComponentPreview figmaFileId={fileId} nodeId={module.id} thumbnailUrl={module.thumbnailUrl} name={module.name} />
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-heading-sm font-semibold text-fics-text mb-4">Usage</h2>
            <p className="text-body text-fics-text-muted">
              The <strong className="text-fics-text font-mono">{module.name}</strong> module is a page-level composition.
              {module.description && ` ${module.description}`}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-[1.3rem] font-semibold text-fics-text mb-3">Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-[1.2rem] text-fics-text-muted">Group</dt>
                <dd className="text-[1.3rem] font-medium text-fics-text">{module.group}</dd>
              </div>
              <div>
                <dt className="text-[1.2rem] text-fics-text-muted">Status</dt>
                <dd><StatusBadge status={module.status} /></dd>
              </div>
            </dl>
          </div>
          <div className="card p-5">
            <h3 className="text-[1.3rem] font-semibold text-fics-text mb-3">Uses components</h3>
            {usedComponents.length > 0 ? (
              <div className="space-y-1">
                {usedComponents.map((comp) => (
                  <Link key={comp.slug} href={`/${tenant}/components/${comp.slug}`}
                    className="flex items-center gap-2 text-[1.3rem] text-fics-text-muted hover:text-fics-heading transition-colors py-0.5">
                    <span className="text-fics-heading/40">→</span>
                    {comp.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[1.2rem] text-fics-text-muted/60 italic">
                {fileId ? 'No components detected' : 'Sync modules from Figma to see components'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
