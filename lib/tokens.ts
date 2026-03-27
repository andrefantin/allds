/**
 * Client-safe token utilities — no Node.js built-ins.
 * Safe to import in both Server and Client components.
 */
import type { TokenFile, TokenCollection, Token, TokenType } from '@/types'

// ─── Figma Variables Export types ────────────────────────────────────────────

export interface FigmaTokenEntry {
  name: string
  value: string | number
  var: string
  rootAlias: string
}

export interface FigmaModeValues {
  mode: { name: string; id: string }
  color?: FigmaTokenEntry[]
  number?: FigmaTokenEntry[]
  string?: FigmaTokenEntry[]
  boolean?: Array<{ name: string; value: boolean; var: string; rootAlias: string }>
}

export type FigmaVariablesExport = Array<{
  name: string
  values: FigmaModeValues[]
}>

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateTokenFile(
  data: unknown
): { valid: boolean; errors: string[]; isFigmaFormat: boolean } {
  // Detect Figma Variables export — root is an array
  if (Array.isArray(data)) {
    return validateFigmaExport(data)
  }

  // Fall back to legacy platform format
  return { ...validatePlatformFormat(data), isFigmaFormat: false }
}

function validateFigmaExport(
  data: unknown[]
): { valid: boolean; errors: string[]; isFigmaFormat: true } {
  const errors: string[] = []

  if (data.length === 0) {
    return {
      valid: false,
      isFigmaFormat: true,
      errors: ['No collections found in this file. The exported JSON array is empty.'],
    }
  }

  for (let i = 0; i < data.length; i++) {
    const col = data[i] as Record<string, unknown>

    if (typeof col.name !== 'string' || !col.name) {
      errors.push(`Collection at index ${i} is missing a "name" field.`)
    }

    if (!Array.isArray(col.values)) {
      errors.push(
        `Collection "${col.name || i}" is missing a "values" array.`
      )
      continue
    }

    for (let j = 0; j < col.values.length; j++) {
      const v = col.values[j] as Record<string, unknown>
      const mode = v.mode as Record<string, unknown> | undefined

      if (!mode || typeof mode.name !== 'string' || !mode.name) {
        errors.push(
          `Collection "${col.name || i}", mode at index ${j} is missing a valid "mode.name".`
        )
      }
    }
  }

  return { valid: errors.length === 0, errors, isFigmaFormat: true }
}

function validatePlatformFormat(
  data: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (typeof data !== 'object' || data === null) {
    return {
      valid: false,
      errors: [
        'The uploaded file appears to be in the wrong format. Expected a Figma Variables export (a JSON array of collections).',
      ],
    }
  }

  const obj = data as Record<string, unknown>

  if (!obj.metadata || typeof obj.metadata !== 'object') {
    errors.push(
      'The uploaded file appears to be in the wrong format. Expected a Figma Variables export (a JSON array of collections).'
    )
  }

  if (!Array.isArray(obj.collections)) {
    errors.push(
      'The root of the JSON must be an array. Make sure you are exporting directly from Figma Variables.'
    )
  }

  return { valid: errors.length === 0, errors }
}

// ─── Figma Export Converter ───────────────────────────────────────────────────

export function convertFigmaExport(
  data: FigmaVariablesExport,
  uploadedAt?: string
): TokenFile {
  const now = uploadedAt || new Date().toISOString()

  const collections: TokenCollection[] = data.map((col) => {
    const modes = col.values.map((v) => v.mode.name)

    // Build tokenName → { type, values: { modeName: value }, aliases: { modeName: aliasName } }
    const tokenMap = new Map<string, { type: TokenType; values: Record<string, string>; aliases: Record<string, string> }>()

    for (const modeValues of col.values) {
      const modeName = modeValues.mode.name

      for (const t of modeValues.color || []) {
        if (!tokenMap.has(t.name)) tokenMap.set(t.name, { type: 'color', values: {}, aliases: {} })
        tokenMap.get(t.name)!.values[modeName] = String(t.value)
        if (t.rootAlias) tokenMap.get(t.name)!.aliases[modeName] = t.rootAlias.replace(/\//g, '-')
      }

      for (const t of modeValues.number || []) {
        const val = String(t.value)
        const type: TokenType = /rem$|px$/.test(val) ? 'dimension' : 'number'
        if (!tokenMap.has(t.name)) tokenMap.set(t.name, { type, values: {}, aliases: {} })
        tokenMap.get(t.name)!.values[modeName] = val
        if (t.rootAlias) tokenMap.get(t.name)!.aliases[modeName] = t.rootAlias.replace(/\//g, '-')
      }

      for (const t of modeValues.string || []) {
        if (!tokenMap.has(t.name)) tokenMap.set(t.name, { type: 'font', values: {}, aliases: {} })
        tokenMap.get(t.name)!.values[modeName] = String(t.value)
        if (t.rootAlias) tokenMap.get(t.name)!.aliases[modeName] = t.rootAlias.replace(/\//g, '-')
      }

      for (const t of modeValues.boolean || []) {
        if (!tokenMap.has(t.name)) tokenMap.set(t.name, { type: 'string', values: {}, aliases: {} })
        tokenMap.get(t.name)!.values[modeName] = String(t.value)
      }
    }

    const tokens: Token[] = Array.from(tokenMap.entries()).map(([name, data]) => {
      const token: Token = {
        name: name.replace(/\//g, '-'),
        category: extractCategory(name),
        type: data.type,
        values: data.values,
      }
      if (Object.keys(data.aliases).length > 0) token.aliases = data.aliases
      return token
    })

    return { name: col.name, modes, tokens }
  })

  return {
    metadata: {
      version: '1.0.0',
      lastUpdated: now.slice(0, 10),
      source: 'Figma Variables Export',
    },
    collections,
  }
}

/** Derives a display category from a Figma token name.
 *  "fi-action-primary/fill/default" → "action-primary"
 *  "Blue/0075C9"                   → "Blue"
 *  "fi-border/color/dark"          → "border"
 */
function extractCategory(name: string): string {
  const withoutPrefix = name.replace(/^fi-/, '')
  return withoutPrefix.split('/')[0] || 'other'
}

// ─── Diff ─────────────────────────────────────────────────────────────────────

export function diffTokenFiles(
  oldFile: TokenFile,
  newFile: TokenFile
): { added: string[]; removed: string[]; changed: Array<{ name: string; oldValue: string; newValue: string }> } {
  const oldTokenMap = new Map<string, Token>()
  const newTokenMap = new Map<string, Token>()

  for (const col of oldFile.collections) {
    for (const token of col.tokens) oldTokenMap.set(token.name, token)
  }
  for (const col of newFile.collections) {
    for (const token of col.tokens) newTokenMap.set(token.name, token)
  }

  const added: string[] = []
  const removed: string[] = []
  const changed: Array<{ name: string; oldValue: string; newValue: string }> = []

  for (const [name] of newTokenMap) {
    if (!oldTokenMap.has(name)) added.push(name)
  }
  for (const [name] of oldTokenMap) {
    if (!newTokenMap.has(name)) removed.push(name)
  }
  for (const [name, newToken] of newTokenMap) {
    const oldToken = oldTokenMap.get(name)
    if (!oldToken) continue
    const oldVal = JSON.stringify(oldToken.values)
    const newVal = JSON.stringify(newToken.values)
    if (oldVal !== newVal) changed.push({ name, oldValue: oldVal, newValue: newVal })
  }

  return { added, removed, changed }
}

// ─── Display utilities ────────────────────────────────────────────────────────

export function groupTokensByCategory(tokens: Token[]): Record<string, Token[]> {
  return tokens.reduce<Record<string, Token[]>>((acc, token) => {
    const cat = token.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(token)
    return acc
  }, {})
}

export function searchTokens(collections: TokenCollection[], query: string): TokenCollection[] {
  if (!query.trim()) return collections
  const q = query.toLowerCase()
  return collections
    .map((col) => ({
      ...col,
      tokens: col.tokens.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      ),
    }))
    .filter((col) => col.tokens.length > 0)
}

export function tokenToCssVar(name: string): string {
  // Normalise slashes to hyphens for CSS: fi-action-primary/fill/default → --fi-action-primary-fill-default
  return `var(--${name.replace(/\//g, '-')})`
}

export function tokenToScss(name: string): string {
  return `$${name.replace(/\//g, '-')}`
}

export function tokenToJs(name: string): string {
  // fi-action-primary/fill/default → tokens.action.primary.fill.default
  return 'tokens.' + name.replace(/^fi-?/, '').replace(/[\/\-]/g, '.')
}
