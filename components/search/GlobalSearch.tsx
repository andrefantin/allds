'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Layers, Box, Circle, Grid } from 'react-feather'
import type { FigmaComponentsData, TokenFile } from '@/types'

interface SearchResult {
  id: string
  type: 'foundation' | 'component' | 'module' | 'token'
  label: string
  sublabel?: string
  href: string
  thumbnailUrl?: string
}

const FOUNDATION_PAGES = [
  { label: 'Introduction', href: '' },
  { label: 'How to use', href: 'how-to-use' },
  { label: 'Border & Radius', href: 'foundation/border' },
  { label: 'Colour', href: 'foundation/colour' },
  { label: 'Colour Accessibility', href: 'foundation/colour-accessibility' },
  { label: 'Design Tokens', href: 'foundation/tokens' },
  { label: 'Elevation', href: 'foundation/elevation' },
  { label: 'Icons', href: 'foundation/icons' },
  { label: 'Spacing', href: 'foundation/spacing' },
  { label: 'Typography', href: 'foundation/typography' },
]

interface Props {
  tenant: string
  figmaData: FigmaComponentsData
  open: boolean
  onClose: () => void
}

export function GlobalSearch({ tenant, figmaData, open, onClose }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [tokens, setTokens] = useState<TokenFile | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const base = `/${tenant}`

  // Fetch tokens lazily on first open
  useEffect(() => {
    if (open && !tokens) {
      fetch(`/${tenant}/api/tokens/current`)
        .then(r => r.ok ? r.json() : null)
        .then((data: unknown) => {
          if (!data || typeof data !== 'object') return
          const d = data as Record<string, unknown>
          const candidate = (d.collections ? d : d.tokens) as Record<string, unknown> | undefined
          if (candidate && Array.isArray(candidate.collections)) {
            setTokens(candidate as unknown as TokenFile)
          }
        })
        .catch(() => {})
    }
  }, [open, tokens, tenant])

  // Focus input when opened, clear query
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  // Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const thumbMap = new Map(figmaData.components.map((c) => [c.slug, c.thumbnailUrl]))

    const foundation: SearchResult[] = FOUNDATION_PAGES
      .filter(p => p.label.toLowerCase().includes(q))
      .map(p => ({
        id: `f-${p.href}`,
        type: 'foundation',
        label: p.label,
        href: `${base}/${p.href}`,
      }))

    const components: SearchResult[] = figmaData.navigation.components
      .flatMap(g => g.items.map(i => ({ ...i, group: g.group })))
      .filter(i => i.status !== 'archived' && i.name.toLowerCase().includes(q))
      .slice(0, 8)
      .map(i => ({
        id: `c-${i.slug}`,
        type: 'component',
        label: i.name,
        sublabel: i.group,
        href: `${base}/components/${i.slug}`,
        thumbnailUrl: thumbMap.get(i.slug),
      }))

    const modules: SearchResult[] = [
      ...figmaData.navigation.modules,
      ...figmaData.navigation.additionalLibraries.flatMap(lib => lib.groups),
    ]
      .flatMap(g => g.items.map(i => ({ ...i, group: g.group })))
      .filter(i => i.status !== 'archived' && i.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map(i => ({
        id: `m-${i.slug}`,
        type: 'module' as const,
        label: i.name,
        sublabel: i.group,
        href: `${base}/modules/${i.slug}`,
      }))

    const tokenResults: SearchResult[] = tokens
      ? tokens.collections
          .flatMap(col =>
            col.tokens
              .filter(t => t.name.toLowerCase().includes(q))
              .slice(0, 3)
              .map(t => ({
                id: `t-${col.name}-${t.name}`,
                type: 'token' as const,
                label: t.name,
                sublabel: col.name.replace(/^[_✅\s]+/, ''),
                href: `${base}/foundation/tokens?q=${encodeURIComponent(t.name)}`,
              }))
          )
          .slice(0, 6)
      : []

    return [...foundation, ...components, ...modules, ...tokenResults]
  }, [query, figmaData, tokens, base])

  useEffect(() => { setActiveIndex(0) }, [results])

  function navigate(href: string) {
    router.push(href)
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      navigate(results[activeIndex].href)
    }
  }

  const typeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'foundation': return <Circle size={13} />
      case 'component': return <Box size={13} />
      case 'module': return <Layers size={13} />
      case 'token': return <Grid size={13} />
    }
  }

  const typeLabel: Record<SearchResult['type'], string> = {
    foundation: 'Foundation',
    component: 'Component',
    module: 'Module',
    token: 'Token',
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-xl mx-4 bg-ds-card rounded-xl border border-ds-border shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ds-border">
          <Search size={16} className="text-ds-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search components, tokens, pages…"
            className="flex-1 bg-transparent text-ds-text placeholder:text-ds-text-muted text-[1.4rem] outline-none"
          />
          <button onClick={onClose} className="text-ds-text-muted hover:text-ds-text transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        {query.trim() ? (
          <div className="max-h-[55vh] overflow-y-auto py-2">
            {results.length === 0 ? (
              <div className="px-4 py-10 text-center text-ds-text-muted text-[1.3rem]">
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              results.map((result, i) => (
                <button
                  key={result.id}
                  onClick={() => navigate(result.href)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === activeIndex ? 'bg-ds-bg-dark' : ''
                  }`}
                >
                  {result.thumbnailUrl ? (
                    <Image
                      src={result.thumbnailUrl}
                      alt={result.label}
                      width={36}
                      height={36}
                      className="rounded border border-ds-border shrink-0 object-cover bg-ds-bg-dark"
                      unoptimized
                    />
                  ) : (
                    <span className="text-ds-text-muted shrink-0">{typeIcon(result.type)}</span>
                  )}
                  <span className="flex-1 min-w-0">
                    <span className="text-[1.3rem] text-ds-text block truncate">{result.label}</span>
                    {result.sublabel && (
                      <span className="text-[1.1rem] text-ds-text-muted">{result.sublabel}</span>
                    )}
                  </span>
                  <span className="text-[1.1rem] text-ds-text-muted shrink-0 capitalize">
                    {typeLabel[result.type]}
                  </span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-ds-text-muted text-[1.3rem]">
            Type to search components, tokens, and pages
          </div>
        )}

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-ds-border text-[1.1rem] text-ds-text-muted">
          <span><kbd className="font-mono bg-ds-bg px-1 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono bg-ds-bg px-1 rounded">↵</kbd> open</span>
          <span><kbd className="font-mono bg-ds-bg px-1 rounded">esc</kbd> close</span>
          <span className="ml-auto"><kbd className="font-mono bg-ds-bg px-1 rounded">/</kbd> to open</span>
        </div>
      </div>
    </div>
  )
}
