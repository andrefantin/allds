'use client'

import { useState } from 'react'
import { ColourSwatch } from './ColourSwatch'
import type { Token } from '@/types'

type ViewMode = 'table' | 'grid'

interface Props {
  colorTokens: Token[]
  mode: string
}

export function ColourCollectionView({ colorTokens, mode }: Props) {
  const [view, setView] = useState<ViewMode>('table')

  return (
    <div>
      {/* View toggle */}
      <div className="flex justify-end mb-3">
        <div className="flex items-center gap-1 bg-ds-bg-dark rounded-lg p-1">
          {(['table', 'grid'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-[1.1rem] rounded-md transition-colors capitalize ${
                view === v
                  ? 'bg-ds-card text-ds-text font-medium shadow-sm'
                  : 'text-ds-text-muted hover:text-ds-text'
              }`}
            >
              {v === 'table' ? 'Table' : 'Swatches'}
            </button>
          ))}
        </div>
      </div>

      {view === 'table' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-ds-border bg-ds-bg">
                  <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-ds-text-muted w-12"></th>
                  <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-ds-text-muted">Token</th>
                  <th className="text-left px-6 py-3 text-[1.2rem] font-semibold uppercase tracking-widest text-ds-text-muted">Reference</th>
                </tr>
              </thead>
              <tbody>
                {colorTokens.map((token, i) => {
                  const value = token.values[mode] || Object.values(token.values)[0]
                  const alias = token.aliases?.[mode] || (token.aliases ? Object.values(token.aliases)[0] : undefined)
                  return (
                    <tr key={token.name} className={`border-b border-ds-border last:border-0 ${i % 2 === 1 ? 'bg-ds-bg/30' : ''}`}>
                      <td className="px-6 py-3 align-middle">
                        <ColourSwatch color={value} compact />
                      </td>
                      <td className="px-6 py-3 align-middle font-mono text-[1.3rem] text-ds-text">{token.name}</td>
                      <td className="px-6 py-3 align-middle">
                        {alias ? (
                          <div>
                            <span className="font-mono text-[1.3rem] text-ds-heading">{alias}</span>
                            <span className="font-mono text-[1.1rem] text-ds-text-muted block">{value}</span>
                          </div>
                        ) : (
                          <span className="font-mono text-[1.2rem] text-ds-text-muted">{value}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {colorTokens.map((token) => {
            const value = token.values[mode] || Object.values(token.values)[0]
            return (
              <div key={token.name} className="card p-3 space-y-2">
                <div
                  className="w-full rounded-md border border-ds-border"
                  style={{ backgroundColor: value, height: '3.6rem' }}
                />
                <div className="font-mono text-[1.1rem] text-ds-text leading-snug break-all">{token.name}</div>
                <div className="font-mono text-[1rem] text-ds-text-muted">{value}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
