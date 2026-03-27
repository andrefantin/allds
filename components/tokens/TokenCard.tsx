'use client'

import { useState } from 'react'
import { cn, copyToClipboard, remToPixels } from '@/lib/utils'
import { tokenToCssVar, tokenToScss, tokenToJs } from '@/lib/tokens'
import { ColourSwatch } from './ColourSwatch'
import toast from 'react-hot-toast'
import type { Token } from '@/types'

interface TokenCardProps {
  token: Token
  activeMode: string
}

type CopyFormat = 'css' | 'scss' | 'js' | 'value'

export function TokenCard({ token, activeMode }: TokenCardProps) {
  const [copyFormat, setCopyFormat] = useState<CopyFormat>('css')
  const [menuOpen, setMenuOpen] = useState(false)

  const value = token.values[activeMode] || Object.values(token.values)[0] || ''
  const alias = token.aliases?.[activeMode] || (token.aliases ? Object.values(token.aliases)[0] : undefined)

  const copyMap: Record<CopyFormat, string> = {
    css: tokenToCssVar(token.name),
    scss: tokenToScss(token.name),
    js: tokenToJs(token.name),
    value,
  }

  async function handleCopy(format: CopyFormat) {
    await copyToClipboard(copyMap[format])
    toast.success(`Copied as ${format.toUpperCase()}`)
    setMenuOpen(false)
  }

  const isColor = token.type === 'color'
  const isDimension = token.type === 'dimension'
  const isShadow = token.type === 'shadow'

  const pxValue = isDimension ? remToPixels(value) : 0

  return (
    <div className="token-row group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-fics-bg-dark/40 transition-all border border-transparent hover:border-fics-border">
      {/* Visual preview */}
      <div className="shrink-0">
        {isColor && (
          <ColourSwatch color={value} name={token.name} compact />
        )}
        {isDimension && (
          <div className="w-8 h-8 flex items-center justify-center">
            <div
              className="bg-fics-heading rounded-sm"
              style={{
                width: Math.min(Math.max(pxValue / 4, 4), 32),
                height: 6,
              }}
            />
          </div>
        )}
        {isShadow && (
          <div className="w-8 h-8 rounded-md bg-white border border-fics-border"
            style={{ boxShadow: value === 'none' ? undefined : value }}
          />
        )}
        {!isColor && !isDimension && !isShadow && (
          <div className="w-8 h-8 rounded-md bg-fics-bg-dark border border-fics-border" />
        )}
      </div>

      {/* Token name + description */}
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[1.3rem] text-fics-text truncate">{token.name}</div>
        {token.description && (
          <div className="text-[1.2rem] text-fics-text-muted truncate">{token.description}</div>
        )}
      </div>

      {/* Value / Alias */}
      <div className="shrink-0 max-w-[24rem] text-right">
        {alias ? (
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-fics-text-muted/40 text-[1.1rem]">→</span>
            <span className="font-mono text-[1.3rem] text-fics-heading truncate">{alias}</span>
          </div>
        ) : (
          <span className="font-mono text-[1.3rem] text-fics-text-muted truncate block">
            {value}
            {isDimension && pxValue > 0 && (
              <span className="text-[1.1rem] text-fics-text-muted/60 ml-1">({pxValue}px)</span>
            )}
          </span>
        )}
        {alias && (
          <div className="font-mono text-[1.1rem] text-fics-text-muted/50 truncate">
            {value}
            {isDimension && pxValue > 0 && ` (${pxValue}px)`}
          </div>
        )}
      </div>

      {/* Copy button with format dropdown */}
      <div className="copy-btn relative shrink-0">
        <div className="flex items-center rounded-lg border border-fics-border overflow-hidden">
          <button
            onClick={() => handleCopy(copyFormat)}
            className="px-3 py-1.5 text-[1.2rem] font-medium text-fics-text-muted hover:text-fics-text hover:bg-fics-bg-dark transition-colors"
          >
            Copy {copyFormat.toUpperCase()}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="px-2 py-1.5 border-l border-fics-border text-fics-text-muted hover:text-fics-text hover:bg-fics-bg-dark transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-card-hover border border-fics-border z-20 py-1 min-w-[14rem] animate-fade-in">
              {(Object.keys(copyMap) as CopyFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => { setCopyFormat(fmt); handleCopy(fmt) }}
                  className="w-full text-left px-4 py-2 hover:bg-fics-bg transition-colors"
                >
                  <span className={cn('text-[1.2rem] font-medium', copyFormat === fmt ? 'text-fics-heading' : 'text-fics-text')}>
                    {fmt === 'css' && `var(--${token.name})`}
                    {fmt === 'scss' && `$${token.name}`}
                    {fmt === 'js' && tokenToJs(token.name)}
                    {fmt === 'value' && value}
                  </span>
                  <span className="text-[1.1rem] text-fics-text-muted block">
                    {fmt === 'css' && 'CSS custom property'}
                    {fmt === 'scss' && 'SCSS variable'}
                    {fmt === 'js' && 'JS/TS constant'}
                    {fmt === 'value' && 'Raw value'}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
