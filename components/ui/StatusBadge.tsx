import { cn } from '@/lib/utils'
import type { ComponentStatus } from '@/types'

interface StatusBadgeProps {
  status: ComponentStatus
  size?: 'sm' | 'md'
}

const config: Record<ComponentStatus, { label: string; className: string }> = {
  stable: { label: 'Live', className: 'badge-stable' },
  beta: { label: 'Beta', className: 'badge-beta' },
  new: { label: 'New', className: 'badge-new' },
  deprecated: { label: 'Archived', className: 'badge-deprecated' },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const { label, className } = config[status] || config.stable
  return (
    <span className={cn('badge', className, size === 'sm' ? 'text-[1rem]' : 'text-[1.2rem]')}>
      {label}
    </span>
  )
}
