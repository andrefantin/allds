'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Check, AlertCircle, CheckCircle } from 'react-feather'
import type { TokenCollection } from '@/types'

// ─── Colour math ──────────────────────────────────────────────────────────────

function parseHex(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '')
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ]
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ]
  }
  return null
}

function parseRgba(value: string): [number, number, number, number] | null {
  const m = value.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/)
  if (!m) return null
  return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), m[4] !== undefined ? parseFloat(m[4]) : 1]
}

function blendOnto(r: number, g: number, b: number, a: number, bg: [number, number, number]): [number, number, number] {
  return [
    Math.round(r * a + bg[0] * (1 - a)),
    Math.round(g * a + bg[1] * (1 - a)),
    Math.round(b * a + bg[2] * (1 - a)),
  ]
}

function parseColor(value: string, bgRgb?: [number, number, number]): [number, number, number] | null {
  if (!value || value === 'transparent' || value === 'none') return null
  if (value.startsWith('#')) return parseHex(value)
  const rgba = parseRgba(value)
  if (rgba) {
    const [r, g, b, a] = rgba
    if (a >= 1) return [r, g, b]
    const bg = bgRgb ?? [255, 255, 255]
    return blendOnto(r, g, b, a, bg)
  }
  return null
}

function linearize(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = luminance(...rgb1)
  const l2 = luminance(...rgb2)
  const hi = Math.max(l1, l2)
  const lo = Math.min(l1, l2)
  return (hi + 0.05) / (lo + 0.05)
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}

// ─── Token family detection ───────────────────────────────────────────────────
// Determines "same family" for suggestions — e.g. text-regular → family "text"

function getFamily(name: string): string {
  const parts = name.toLowerCase().split(/[-_\/]/)
  const broad = ['color', 'colours', 'colors', 'col', 'palette']
  if (broad.includes(parts[0]) && parts.length > 1) return `${parts[0]}-${parts[1]}`
  return parts[0]
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ColorToken {
  name: string
  value: string
  rgb: [number, number, number]
}

interface Suggestion {
  token: ColorToken
  ratio: number
  passesAA: boolean
  passesAAA: boolean
}

// ─── Token picker ─────────────────────────────────────────────────────────────

function TokenPicker({
  label,
  tokens,
  selected,
  onSelect,
}: {
  label: string
  tokens: ColorToken[]
  selected: ColorToken | null
  onSelect: (t: ColorToken) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(
    () => (!search ? tokens : tokens.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))),
    [tokens, search]
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else setSearch('')
  }, [open])

  return (
    <div ref={ref} className="relative">
      <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-text-muted mb-2">{label}</p>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-lg border bg-fics-card text-left transition-colors',
          open ? 'border-fics-heading/40' : 'border-fics-border hover:border-fics-heading/30'
        )}
      >
        {selected ? (
          <>
            <div
              className="w-6 h-6 rounded shrink-0 border border-black/10"
              style={{ backgroundColor: rgbToHex(...selected.rgb) }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[1.3rem] text-fics-text truncate">{selected.name}</div>
              <div className="font-mono text-[1.1rem] text-fics-text-muted">{selected.value}</div>
            </div>
          </>
        ) : (
          <span className="text-[1.3rem] text-fics-text-muted flex-1">Select a colour token…</span>
        )}
        <ChevronDown
          size={14}
          className={cn('text-fics-text-muted shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-fics-card rounded-lg border border-fics-border shadow-card-hover max-h-[28rem] flex flex-col">
          <div className="p-2 border-b border-fics-border shrink-0">
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tokens…"
              className="w-full px-3 py-2 text-[1.3rem] bg-fics-bg rounded-md border border-fics-border focus:outline-none focus:border-fics-heading/30 text-fics-text placeholder:text-fics-text-muted"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-[1.2rem] text-fics-text-muted">No tokens found.</p>
            ) : (
              filtered.map((token) => (
                <button
                  key={token.name}
                  onClick={() => { onSelect(token); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-fics-bg transition-colors',
                    selected?.name === token.name && 'bg-fics-bg'
                  )}
                >
                  <div
                    className="w-5 h-5 rounded shrink-0 border border-black/10"
                    style={{ backgroundColor: rgbToHex(...token.rgb) }}
                  />
                  <span className="font-mono text-[1.3rem] text-fics-text flex-1 truncate">{token.name}</span>
                  {selected?.name === token.name && (
                    <Check size={12} className="text-fics-heading shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── WCAG badge ───────────────────────────────────────────────────────────────

function WcagBadge({ label, sub, passes }: { label: string; sub: string; passes: boolean }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[1.2rem] font-medium',
        passes ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
      )}
    >
      {passes ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
      <span>{label}</span>
      <span className="opacity-60 text-[1.1rem]">{sub}</span>
    </div>
  )
}

// ─── Suggestion row ───────────────────────────────────────────────────────────

function SuggestionCard({
  title,
  subtitle,
  items,
  lockedToken,
  lockedRole,
  onUse,
}: {
  title: string
  subtitle: string
  items: Suggestion[]
  lockedToken: ColorToken
  lockedRole: 'bg' | 'fg'
  onUse: (t: ColorToken) => void
}) {
  if (items.length === 0) return null
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-fics-border bg-fics-bg">
        <p className="text-[1.3rem] font-semibold text-fics-text">{title}</p>
        <p className="text-[1.2rem] text-fics-text-muted">{subtitle}</p>
      </div>
      <div className="divide-y divide-fics-border">
        {items.map(({ token, ratio, passesAAA }) => {
          const bgRgb = lockedRole === 'bg' ? lockedToken.rgb : token.rgb
          const fgRgb = lockedRole === 'bg' ? token.rgb : lockedToken.rgb
          return (
            <div key={token.name} className="flex items-center gap-4 px-5 py-3">
              {/* Mini preview */}
              <div
                className="w-16 h-10 rounded-md shrink-0 flex items-center justify-center border border-black/10 text-[1.1rem] font-bold select-none"
                style={{ backgroundColor: rgbToHex(...bgRgb), color: rgbToHex(...fgRgb) }}
              >
                Aa
              </div>
              {/* Token info */}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[1.3rem] text-fics-text truncate">{token.name}</div>
                <div className="font-mono text-[1.1rem] text-fics-text-muted">{token.value}</div>
              </div>
              {/* Ratio + level */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[1.3rem] font-semibold text-fics-text tabular-nums">
                  {ratio.toFixed(2)} : 1
                </span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[1.1rem] font-semibold',
                    passesAAA ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  )}
                >
                  {passesAAA ? 'AAA' : 'AA'}
                </span>
              </div>
              {/* Use button */}
              <button
                onClick={() => onUse(token)}
                className="shrink-0 px-3 py-1.5 text-[1.2rem] bg-fics-heading text-white rounded-lg hover:bg-fics-heading/90 transition-colors"
              >
                Use
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ColourAccessibilityChecker({ collections }: { collections: TokenCollection[] }) {
  const allModes = useMemo(() => {
    const seen = new Set<string>()
    collections.forEach((c) => c.modes.forEach((m) => seen.add(m)))
    return [...seen]
  }, [collections])

  const [activeMode, setActiveMode] = useState(allModes[0] ?? '')
  const [bgToken, setBgToken] = useState<ColorToken | null>(null)
  const [fgToken, setFgToken] = useState<ColorToken | null>(null)

  // Flat list of resolvable colour tokens for the active mode
  const colorTokens = useMemo((): ColorToken[] => {
    const out: ColorToken[] = []
    for (const col of collections) {
      for (const token of col.tokens) {
        if (token.type !== 'color') continue
        const value = token.values[activeMode] ?? Object.values(token.values)[0]
        const rgb = parseColor(value)
        if (!rgb) continue
        out.push({ name: token.name, value, rgb })
      }
    }
    return out
  }, [collections, activeMode])

  // Reset pickers when mode changes
  useEffect(() => { setBgToken(null); setFgToken(null) }, [activeMode])

  // Contrast result
  const result = useMemo(() => {
    if (!bgToken || !fgToken) return null
    // Blend text alpha against bg if needed
    const fgRgb = parseColor(fgToken.value, bgToken.rgb) ?? fgToken.rgb
    const ratio = contrastRatio(bgToken.rgb, fgRgb)
    return {
      ratio,
      fgRgb,
      aa: ratio >= 4.5,
      aaLarge: ratio >= 3.0,
      aaa: ratio >= 7.0,
    }
  }, [bgToken, fgToken])

  // Suggestions — only when failing AA
  const suggestions = useMemo(() => {
    if (!bgToken || !fgToken || !result || result.aa) return null

    function find(lockedRgb: [number, number, number], failingToken: ColorToken): Suggestion[] {
      const family = getFamily(failingToken.name)
      let pool = colorTokens.filter(
        (t) => t.name !== failingToken.name && getFamily(t.name) === family
      )
      // Expand to all tokens if the same-family pool is too small
      if (pool.length < 2) {
        pool = colorTokens.filter((t) => t.name !== failingToken.name)
      }
      return pool
        .map((token) => {
          const ratio = contrastRatio(lockedRgb, token.rgb)
          return { token, ratio, passesAA: ratio >= 4.5, passesAAA: ratio >= 7.0 }
        })
        .filter((s) => s.passesAA)
        // Sort by closest to the minimum AA threshold first — least dramatic change
        .sort((a, b) => a.ratio - b.ratio)
        .slice(0, 4)
    }

    return {
      keepBg: find(bgToken.rgb, fgToken),   // lock bg, swap text
      keepFg: find(fgToken.rgb, bgToken),   // lock text, swap bg
    }
  }, [bgToken, fgToken, result, colorTokens])

  return (
    <div className="p-4 md:p-8 max-w-[80rem] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-heading mb-1">Foundation</p>
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">Colour Accessibility</h1>
        <p className="text-body text-fics-text-muted max-w-[60rem]">
          Test colour combinations against WCAG 2.2 AA (4.5:1) and AAA (7:1) contrast standards. If a pair fails, the platform will suggest the closest passing alternatives from the same token family.
        </p>
      </div>

      {/* Mode switcher */}
      {allModes.length > 1 && (
        <div className="flex items-center gap-1 mb-6 bg-fics-bg-dark rounded-lg p-1 w-fit">
          {allModes.map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={cn(
                'px-4 py-1.5 rounded-md text-[1.3rem] font-medium transition-all',
                activeMode === mode
                  ? 'bg-fics-card shadow-card text-fics-text'
                  : 'text-fics-text-muted hover:text-fics-text'
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      )}

      {colorTokens.length === 0 ? (
        <div className="card p-8 text-fics-text-muted text-[1.3rem]">
          No colour tokens found. Upload a token file to use this tool.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TokenPicker label="Background" tokens={colorTokens} selected={bgToken} onSelect={setBgToken} />
            <TokenPicker label="Text colour" tokens={colorTokens} selected={fgToken} onSelect={setFgToken} />
          </div>

          {/* Preview + contrast result */}
          {result && bgToken && fgToken && (
            <div className="card overflow-hidden">
              {/* Live preview */}
              <div
                className="p-8 md:p-12"
                style={{ backgroundColor: rgbToHex(...bgToken.rgb) }}
              >
                <p
                  className="text-[2.4rem] font-bold mb-3 leading-tight"
                  style={{ color: rgbToHex(...result.fgRgb) }}
                >
                  Heading sample text
                </p>
                <p
                  className="text-[1.4rem] leading-relaxed max-w-[52rem]"
                  style={{ color: rgbToHex(...result.fgRgb) }}
                >
                  The quick brown fox jumps over the lazy dog. Body text should meet AA standard for normal text at a minimum contrast of 4.5 : 1.
                </p>
              </div>

              {/* Result bar */}
              <div className="p-5 border-t border-fics-border flex flex-wrap items-center gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-[3.2rem] font-bold text-fics-text tabular-nums leading-none">
                    {result.ratio.toFixed(2)}
                  </span>
                  <span className="text-[1.6rem] text-fics-text-muted">: 1</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <WcagBadge label="AA" sub="normal" passes={result.aa} />
                  <WcagBadge label="AA" sub="large" passes={result.aaLarge} />
                  <WcagBadge label="AAA" sub="normal" passes={result.aaa} />
                </div>
                <div className="ml-auto flex items-center gap-2 text-[1.2rem] text-fics-text-muted font-mono">
                  <div className="w-4 h-4 rounded border border-black/10" style={{ backgroundColor: rgbToHex(...bgToken.rgb) }} />
                  {bgToken.value}
                  <span className="mx-1">on</span>
                  <div className="w-4 h-4 rounded border border-black/10" style={{ backgroundColor: rgbToHex(...result.fgRgb) }} />
                  {fgToken.value}
                </div>
              </div>
            </div>
          )}

          {/* Pass message */}
          {result?.aa && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle size={16} />
              <p className="text-[1.3rem] font-medium">
                This combination passes WCAG AA.
                {result.aaa ? ' It also meets the stricter AAA standard.' : ' It does not meet the stricter AAA standard (7 : 1).'}
              </p>
            </div>
          )}

          {/* Fail + suggestions */}
          {result && !result.aa && suggestions && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p className="text-[1.3rem] font-medium">
                  This combination fails WCAG AA ({result.ratio.toFixed(2)} : 1, minimum 4.5 : 1).
                  Below are the closest passing alternatives from the same token families — click <strong>Use</strong> to apply one.
                </p>
              </div>

              {bgToken && fgToken && (
                <>
                  <SuggestionCard
                    title={`Keep ${bgToken.name} as background`}
                    subtitle={`Looking for alternative text colours in the "${getFamily(fgToken.name)}" family`}
                    items={suggestions.keepBg}
                    lockedToken={bgToken}
                    lockedRole="bg"
                    onUse={setFgToken}
                  />
                  <SuggestionCard
                    title={`Keep ${fgToken.name} as text`}
                    subtitle={`Looking for alternative backgrounds in the "${getFamily(bgToken.name)}" family`}
                    items={suggestions.keepFg}
                    lockedToken={fgToken}
                    lockedRole="fg"
                    onUse={setBgToken}
                  />
                </>
              )}

              {suggestions.keepBg.length === 0 && suggestions.keepFg.length === 0 && (
                <div className="card p-6 text-[1.3rem] text-fics-text-muted">
                  No passing alternatives found in this token set. Consider reviewing your colour scale.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
