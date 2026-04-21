import Link from 'next/link'
import { Sliders } from 'react-feather'
import type { FigmaComponent } from '@/types'

interface ComponentMetaProps {
  component: FigmaComponent
  showFigmaLink?: boolean
  explorePath?: string
}

export function ComponentMeta({ component, showFigmaLink = true, explorePath }: ComponentMetaProps) {
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

      {(showFigmaLink && component.figmaUrl) || explorePath ? (
        <div className="flex items-center gap-3 flex-wrap">
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
          {explorePath && (
            <Link
              href={explorePath}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-ds-border hover:bg-ds-bg-dark transition-colors text-[1.3rem] font-medium text-ds-text"
            >
              <Sliders size={16} /> Explore behaviour
            </Link>
          )}
        </div>
      ) : null}
    </div>
  )
}
