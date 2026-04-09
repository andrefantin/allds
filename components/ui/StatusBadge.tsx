import { cn } from '@/lib/utils'
import type { ComponentStatus } from '@/types'

interface StatusBadgeProps {
  status: ComponentStatus
  size?: 'sm' | 'md'
}

const config: Record<ComponentStatus, { label: string; className: string }> = {
  live: { label: 'Live', className: 'badge-stable' },
  testing: { label: 'Testing', className: 'badge-beta' },
  new: { label: 'New', className: 'badge-new' },
  archived: { label: 'Archived', className: 'badge-deprecated' },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const { label, className } = config[status] || config.live
  return (
    <span className={cn('badge', className, size === 'sm' ? 'text-[1rem]' : 'text-[1.2rem]')}>
      {label}
    </span>
  )
}
