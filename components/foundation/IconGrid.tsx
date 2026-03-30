'use client'

import { useState, useMemo } from 'react'
import type { FigmaIcon } from '@/types'

interface IconGridProps {
  icons: FigmaIcon[]
}

export function IconGrid({ icons }: IconGridProps) {
  const [search, setSearch] = useState('')
  const [activeSize, setActiveSize] = useState<number | 'all'>('all')
  const [copied, setCopied] = useState<string | null>(null)

  const sizes = useMemo(() => {
    const s = [...new Set(icons.map((i) => i.size))].sort((a, b) => a - b)
    return s
  }, [icons])

  const categories = useMemo(() => {
    return [...new Set(icons.map((i) => i.category))].sort((a, b) => {
      // Sort numerically if categories are sizes like "16px", "24px"
      const aNum = parseInt(a)
      const bNum = parseInt(b)
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
      return a.localeCompare(b)
    })
  }, [icons])

  const filtered = useMemo(() => {
    return icons.filter((icon) => {
      const matchSearch = !search || icon.name.toLowerCase().includes(search.toLowerCase())
      const matchSize = activeSize === 'all' || icon.size === activeSize
      return matchSearch && matchSize
    })
  }, [icons, search, activeSize])

  const grouped = useMemo(() => {
    return categories.reduce<Record<string, FigmaIcon[]>>((acc, cat) => {
      const items = filtered.filter((i) => i.category === cat)
      if (items.length > 0) acc[cat] = items
      return acc
    }, {})
  }, [filtered, categories])

  function copyName(name: string) {
    navigator.clipboard.writeText(name).then(() => {
      setCopied(name)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-[32rem]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fics-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons…"
            className="w-full pl-9 pr-3 py-2 text-[1.3rem] bg-white rounded-lg border border-fics-border placeholder:text-fics-text-muted text-fics-text focus:outline-none focus:border-fics-heading/30 transition-colors"
          />
        </div>
        {sizes.length > 1 && (
          <div className="flex items-center gap-1 bg-fics-bg border border-fics-border rounded-lg p-1">
            <button
              onClick={() => setActiveSize('all')}
              className={`px-3 py-1.5 rounded-md text-[1.2rem] font-medium transition-colors ${activeSize === 'all' ? 'bg-white shadow-sm text-fics-text' : 'text-fics-text-muted hover:text-fics-text'}`}
            >
              All
            </button>
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSize(s)}
                className={`px-3 py-1.5 rounded-md text-[1.2rem] font-medium transition-colors ${activeSize === s ? 'bg-white shadow-sm text-fics-text' : 'text-fics-text-muted hover:text-fics-text'}`}
              >
                {s}px
              </button>
            ))}
          </div>
        )}
        <span className="text-[1.2rem] text-fics-text-muted shrink-0">{filtered.length} icons</span>
      </div>

      {/* Icon grid */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-fics-text-muted">
          <p className="text-[1.4rem]">No icons match your search.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              {Object.keys(grouped).length > 1 && (
                <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted mb-4">
                  {category}
                </h2>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                {items.map((icon) => (
                  <button
                    key={`${icon.name}-${icon.size}`}
                    onClick={() => copyName(icon.name)}
                    className="group flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-fics-bg-dark cursor-pointer transition-colors text-left"
                    title={`${icon.name} (${icon.size}px) — click to copy name`}
                  >
                    <div
                      className="text-fics-text flex items-center justify-center shrink-0"
                      dangerouslySetInnerHTML={{ __html: icon.svgContent }}
                    />
                    <span className="text-[1rem] text-fics-text-muted text-center leading-tight break-all opacity-0 group-hover:opacity-100 transition-opacity w-full">
                      {copied === icon.name ? '✓ copied' : icon.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
