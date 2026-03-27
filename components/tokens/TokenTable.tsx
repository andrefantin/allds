'use client'

import { useState, useMemo } from 'react'
import { ModesTabs } from './ModesTabs'
import { TokenCard } from './TokenCard'
import { groupTokensByCategory } from '@/lib/tokens'
import type { TokenCollection } from '@/types'

interface TokenTableProps {
  collection: TokenCollection
  searchQuery?: string
}

export function TokenTable({ collection, searchQuery }: TokenTableProps) {
  const filteredTokens = useMemo(() => {
    if (!searchQuery) return collection.tokens
    const q = searchQuery.toLowerCase()
    return collection.tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q))
    )
  }, [collection.tokens, searchQuery])

  const grouped = useMemo(
    () => groupTokensByCategory(filteredTokens),
    [filteredTokens]
  )

  if (filteredTokens.length === 0) {
    return (
      <div className="py-12 text-center text-fics-text-muted text-body">
        No tokens match your search.
      </div>
    )
  }

  return (
    <ModesTabs modes={collection.modes}>
      {(activeMode) => (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, tokens]) => (
            <div key={category}>
              <h3 className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted mb-2 px-4">
                {category}
              </h3>
              <div className="space-y-0.5">
                {tokens.map((token) => (
                  <TokenCard key={token.name} token={token} activeMode={activeMode} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </ModesTabs>
  )
}
