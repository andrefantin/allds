'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { remToPixels } from '@/lib/utils'
import type { TokenCollection } from '@/types'

interface SpacingTableProps {
  collection: TokenCollection
  tokens: TokenCollection['tokens']
}

export function SpacingTable({ collection, tokens }: SpacingTableProps) {
  const [activeMode, setActiveMode] = useState(collection.modes[0])

  return (
    <div>
      {collection.modes.length > 1 && (
        <div className="flex items-center gap-1 mb-4 bg-fics-bg-dark rounded-lg p-1 w-fit">
          {collection.modes.map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={cn(
                'px-4 py-1.5 rounded-md text-[1.3rem] font-medium transition-all',
                activeMode === mode
                  ? 'bg-white shadow-card text-fics-text'
                  : 'text-fics-text-muted hover:text-fics-text'
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      )}

      <div className="card p-6 space-y-4">
        {tokens.map((token) => {
          const value = token.values[activeMode] || Object.values(token.values)[0]
          const px = remToPixels(value)
          return (
            <div key={token.name} className="flex items-center gap-6">
              <div className="w-56 shrink-0">
                <div className="font-mono text-[1.3rem] text-fics-text">{token.name}</div>
                <div className="text-[1.2rem] text-fics-text-muted">{value} · {px}px</div>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div
                  className="h-5 rounded bg-fics-heading/70 shrink-0"
                  style={{ width: Math.max(Math.min(px * 2, 600), 4) }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
