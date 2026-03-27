'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ModesTabsProps {
  modes: string[]
  children: (activeMode: string) => React.ReactNode
}

export function ModesTabs({ modes, children }: ModesTabsProps) {
  const [active, setActive] = useState(modes[0])

  if (modes.length <= 1) {
    return <>{children(modes[0])}</>
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-4 bg-fics-bg-dark rounded-lg p-1 w-fit">
        {modes.map((mode) => (
          <button
            key={mode}
            onClick={() => setActive(mode)}
            className={cn(
              'px-4 py-1.5 rounded-md text-[1.3rem] font-medium transition-all',
              active === mode
                ? 'bg-white shadow-card text-fics-text'
                : 'text-fics-text-muted hover:text-fics-text'
            )}
          >
            {mode}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  )
}
