'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'react-feather'
import { StatusBadge } from './StatusBadge'
import type { FigmaComponent, ComponentStatus } from '@/types'

type FilterStatus = 'all' | ComponentStatus

interface Props {
  items: FigmaComponent[]
  tenant: string
  type: 'components' | 'modules'
  columns?: 3 | 4
}

export function ComponentGrid({ items, tenant, type, columns = 4 }: Props) {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')

  const availableStatuses = Array.from(new Set(items.map((i) => i.status).filter(Boolean))) as ComponentStatus[]

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: `All (${items.length})` },
    ...(['live', 'testing', 'new', 'archived'] as ComponentStatus[])
      .filter((s) => availableStatuses.includes(s))
      .map((s) => ({
        value: s,
        label: `${s.charAt(0).toUpperCase()}${s.slice(1)} (${items.filter((i) => i.status === s).length})`,
      })),
  ]

  const filtered = items.filter((item) => {
    if (filter !== 'all' && item.status !== filter) return false
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const colClass = columns === 4
    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    : 'grid-cols-2 md:grid-cols-3'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Status filter pills */}
        <div className="flex items-center gap-1 bg-ds-bg-dark rounded-lg p-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 text-[1.2rem] rounded-md transition-colors ${
                filter === opt.value
                  ? 'bg-ds-card text-ds-text font-medium shadow-sm'
                  : 'text-ds-text-muted hover:text-ds-text'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Inline name search */}
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ds-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name…"
            className="pl-8 pr-3 py-1.5 text-[1.3rem] bg-ds-bg-dark border border-ds-border rounded-lg placeholder:text-ds-text-muted text-ds-text focus:outline-none focus:border-ds-heading/30 transition-colors"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-ds-text-muted text-[1.3rem]">No results match your filter.</p>
      ) : (
        <div className={`grid ${colClass} gap-3`}>
          {filtered.map((item) => (
            <Link
              key={item.slug}
              href={`/${tenant}/${type}/${item.slug}`}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-semibold text-ds-text text-[1.3rem] leading-snug">{item.name}</div>
                <StatusBadge status={item.status} />
              </div>
              <div className="text-[1.2rem] text-ds-text-muted">{item.group}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
