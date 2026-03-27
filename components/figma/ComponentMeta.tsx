import { cn } from '@/lib/utils'
import type { FigmaComponent } from '@/types'

interface ComponentMetaProps {
  component: FigmaComponent
  showFigmaLink?: boolean
}

const statusConfig = {
  stable: { label: 'Stable', className: 'badge-stable' },
  beta: { label: 'Beta', className: 'badge-beta' },
  new: { label: 'New', className: 'badge-new' },
  deprecated: { label: 'Deprecated', className: 'badge-deprecated' },
}

export function ComponentMeta({ component, showFigmaLink = true }: ComponentMetaProps) {
  const status = statusConfig[component.status] || statusConfig.stable

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 flex-wrap">
        <span className={cn('badge text-[1.2rem]', status.className)}>
          {status.label}
        </span>
        <span className="badge bg-fics-bg text-fics-text-muted border border-fics-border">
          {component.group}
        </span>
        <span className="badge bg-fics-bg text-fics-text-muted border border-fics-border">
          {component.fileType === 'modules' ? 'Module' : 'Component'}
        </span>
      </div>

      {component.description && (
        <p className="text-body text-fics-text-muted leading-relaxed">{component.description}</p>
      )}

      {showFigmaLink && component.figmaUrl && (
        <a
          href={component.figmaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-fics-border hover:bg-fics-bg-dark transition-colors text-[1.3rem] font-medium text-fics-text"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.332 8.668a3.333 3.333 0 000-6.663H8.668a3.333 3.333 0 000 6.663 3.333 3.333 0 000 6.665 3.333 3.333 0 006.665 0V8.668zm0 0a3.333 3.333 0 106.663 0 3.333 3.333 0 00-6.663 0z" />
          </svg>
          View in Figma
        </a>
      )}
    </div>
  )
}
