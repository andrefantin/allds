'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ModesTabsProps {
  modes: string[]
  panels: React.ReactNode[]
}

export function ModesTabs({ modes, panels }: ModesTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (modes.length <= 1) {
    return <>{panels[0]}</>
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-4 bg-fics-bg-dark rounded-lg p-1 w-fit">
        {modes.map((mode, i) => (
          <button
            key={mode}
            onClick={() => setActiveIndex(i)}
            className={cn(
              'px-4 py-1.5 rounded-md text-[1.3rem] font-medium transition-all',
              activeIndex === i
                ? 'bg-white shadow-card text-fics-text'
                : 'text-fics-text-muted hover:text-fics-text'
            )}
          >
            {mode}
          </button>
        ))}
      </div>
      {panels[activeIndex]}
    </div>
  )
}
