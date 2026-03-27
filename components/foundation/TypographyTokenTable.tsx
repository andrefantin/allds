'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { TokenCollection } from '@/types'

interface TypographyTokenTableProps {
  collection: TokenCollection
}

export function TypographyTokenTable({ collection }: TypographyTokenTableProps) {
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

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-fics-border bg-fics-bg">
              <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">Token</th>
              <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">Value</th>
              <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted">Preview</th>
            </tr>
          </thead>
          <tbody>
            {collection.tokens.map((token, i) => {
              const value = token.values[activeMode] || Object.values(token.values)[0]
              return (
                <tr key={token.name} className={`border-b border-fics-border ${i % 2 === 1 ? 'bg-fics-bg/30' : ''}`}>
                  <td className="px-6 py-3 font-mono text-[1.3rem] text-fics-text">{token.name}</td>
                  <td className="px-6 py-3 font-mono text-[1.2rem] text-fics-text-muted">{value}</td>
                  <td className="px-6 py-3">
                    <span style={{ fontSize: value, lineHeight: 1.2 }} className="text-fics-text font-medium">
                      Aa
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
