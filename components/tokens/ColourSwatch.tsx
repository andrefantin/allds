'use client'

import { useState } from 'react'
import { cn, getContrastColor, isValidHex, copyToClipboard } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ColourSwatchProps {
  color: string
  name: string
  compact?: boolean
}

export function ColourSwatch({ color, name, compact = false }: ColourSwatchProps) {
  const [copied, setCopied] = useState(false)

  const isTransparent = color === 'transparent' || color === 'none'
  const isRgba = color.startsWith('rgba')
  const displayColor = isTransparent ? '#ffffff' : color
  const textColor = isRgba || isTransparent
    ? '#07272c'
    : (isValidHex(color) ? getContrastColor(color) : '#07272c')

  async function handleCopy() {
    await copyToClipboard(color)
    setCopied(true)
    toast.success('Copied!')
    setTimeout(() => setCopied(false), 1500)
  }

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        title={`Copy ${color}`}
        className={cn(
          'w-8 h-8 rounded-lg border border-fics-border shrink-0 transition-transform hover:scale-110 relative',
          isTransparent && 'checkered'
        )}
        style={{
          backgroundColor: displayColor,
          backgroundImage: isTransparent
            ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 8px 8px'
            : undefined,
        }}
      >
        {isRgba && (
          <div
            className="absolute inset-0 rounded-lg"
            style={{ backgroundColor: color }}
          />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleCopy}
      className="group relative w-full aspect-square rounded-md overflow-hidden border border-fics-border transition-transform hover:scale-105 hover:shadow-card-hover"
      style={{
        backgroundColor: isTransparent ? undefined : (isRgba ? undefined : displayColor),
        backgroundImage: isTransparent
          ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 12px 12px'
          : undefined,
      }}
    >
      {isRgba && (
        <div className="absolute inset-0" style={{ backgroundColor: color }} />
      )}
      <div
        className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: textColor }}
      >
        <span className="text-[1rem] font-medium bg-black/10 backdrop-blur-sm px-2 py-1 rounded-md truncate max-w-full">
          {copied ? '✓ Copied' : color}
        </span>
      </div>
    </button>
  )
}
