import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'react-feather'
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
    for (const lib of figmaData.navigation.additionalLibraries) {
      for (const group of lib.groups) {
        const item = group.items.find((i: NavigationItem) => i.slug === s)
        if (item) {
          return { id: s, key: s, name: item.name, slug: item.slug, description: `${item.name} module.`, status: item.status as ComponentStatus, group: group.group, fileType: 'modules' }
        }
      }
    }
    return null
  }

  const allLibraryModules = figmaData.additionalLibraries.flatMap((lib) => lib.modules)
  const module = figmaData.modules.find((m) => m.slug === slug)
    || allLibraryModules.find((m) => m.slug === slug)
    || buildModuleFromNav(slug)
  if (!module) notFound()

  const figmaUrlFileId = module.figmaUrl?.match(/figma\.com\/file\/([^/?]+)/)?.[1]
  const fileId = figmaUrlFileId ?? settings.figmaFileModules
  const figmaToken = settings.figmaToken

  const hasFigmaNodeId = /^\d+[:‑-]\d+$/.test(module.id) || /^\d+:\d+$/.test(module.id)
  const usedComponents = fileId && hasFigmaNodeId && figmaToken
    ? await fetchComponentsUsedInModule(fileId, module.id, figmaData.components, figmaToken)
    : []
  const needsSync = !hasFigmaNodeId

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      {/* Breadcrumb + quick actions */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <nav className="flex items-center gap-2 text-[1.3rem] text-ds-text-muted">
          <Link href={`/${tenant}/modules`} className="hover:text-ds-text transition-colors">Modules</Link>
          <span>/</span>
          <span className="text-ds-text font-medium">{module.name}</span>
        </nav>
        {module.figmaUrl && (
          <a href={module.figmaUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[1.2rem] text-ds-heading hover:underline shrink-0">
            Open in Figma <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Title row */}
      <div className="flex items-start gap-3 mb-1">
        <h1 className="text-heading-lg font-bold text-ds-text">{module.name}</h1>
        <span className="mt-1.5"><StatusBadge status={module.status} size="md" /></span>
      </div>
      <p className="text-[1.3rem] text-ds-text-muted mb-8">{module.group}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ComponentMeta component={module} />
          <div className="card overflow-hidden">
            <div className="px-6 py-3 border-b border-ds-border">
              <h2 className="text-[1.4rem] font-semibold text-ds-text">Preview</h2>
            </div>
            <div className="p-6">
              <ComponentPreview figmaFileId={fileId} nodeId={module.id} thumbnailUrl={module.thumbnailUrl} name={module.name} />
            </div>
          </div>
          {module.description && (
            <div className="card p-6">
              <h2 className="text-heading-sm font-semibold text-ds-text mb-3">Usage</h2>
              <p className="text-body text-ds-text-muted">{module.description}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-[1.3rem] font-semibold text-ds-text mb-3">Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-[1.2rem] text-ds-text-muted">Group</dt>
                <dd className="text-[1.3rem] font-medium text-ds-text">{module.group}</dd>
              </div>
              <div>
                <dt className="text-[1.2rem] text-ds-text-muted">Status</dt>
                <dd className="mt-0.5"><StatusBadge status={module.status} /></dd>
              </div>
            </dl>
          </div>
          <div className="card p-5">
            <h3 className="text-[1.3rem] font-semibold text-ds-text mb-3">Uses components</h3>
            {usedComponents.length > 0 ? (
              <div className="space-y-1">
                {usedComponents.map((comp) => (
                  <Link key={comp.slug} href={`/${tenant}/components/${comp.slug}`}
                    className="flex items-center gap-2 text-[1.3rem] text-ds-text-muted hover:text-ds-heading transition-colors py-0.5">
                    <span className="text-ds-heading/40">→</span>
                    {comp.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[1.2rem] text-ds-text-muted/60 italic">
                {needsSync
                  ? 'Sync from Figma to detect components used in this module'
                  : fileId ? 'No components detected' : 'Configure a Figma modules file in Settings'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
