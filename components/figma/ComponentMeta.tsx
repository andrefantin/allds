import type { FigmaComponent } from '@/types'

interface ComponentMetaProps {
  component: FigmaComponent
  showFigmaLink?: boolean
}

export function ComponentMeta({ component, showFigmaLink = true }: ComponentMetaProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 flex-wrap">
        <span className="badge bg-ds-bg text-ds-text-muted border border-ds-border">
          {component.group}
        </span>
        <span className="badge bg-ds-bg text-ds-text-muted border border-ds-border">
          {component.fileType === 'modules' ? 'Module' : 'Component'}
        </span>
      </div>

      {showFigmaLink && component.figmaUrl && (
        <a
          href={component.figmaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-ds-border hover:bg-ds-bg-dark transition-colors text-[1.3rem] font-medium text-ds-text"
        >
          View in Figma
        </a>
      )}
    </div>
  )
}
