#!/usr/bin/env node
/**
 * One-off script: converts a Figma Variables export to the internal TokenFile
 * format and writes it to data/tokens.json.
 *
 * Usage: node scripts/convert-tokens.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const figmaData = JSON.parse(readFileSync(join(root, 'scripts', 'figma-export.json'), 'utf-8'))

function extractCategory(name) {
  const withoutPrefix = name.replace(/^fi-/, '')
  return withoutPrefix.split('/')[0] || 'other'
}

const collections = figmaData.map((col) => {
  const modes = col.values.map((v) => v.mode.name)
  const tokenMap = new Map()

  for (const modeValues of col.values) {
    const modeName = modeValues.mode.name

    for (const t of modeValues.color || []) {
      if (!tokenMap.has(t.name)) tokenMap.set(t.name, { type: 'color', values: {}, aliases: {} })
      tokenMap.get(t.name).values[modeName] = String(t.value)
      if (t.rootAlias) tokenMap.get(t.name).aliases[modeName] = t.rootAlias.replace(/\//g, '-')
    }

    for (const t of modeValues.number || []) {
      const val = String(t.value)
      const type = /rem$|px$/.test(val) ? 'dimension' : 'number'
      if (!tokenMap.has(t.name)) tokenMap.set(t.name, { type, values: {}, aliases: {} })
      tokenMap.get(t.name).values[modeName] = val
      if (t.rootAlias) tokenMap.get(t.name).aliases[modeName] = t.rootAlias.replace(/\//g, '-')
    }

    for (const t of modeValues.string || []) {
      if (!tokenMap.has(t.name)) tokenMap.set(t.name, { type: 'font', values: {}, aliases: {} })
      tokenMap.get(t.name).values[modeName] = String(t.value)
      if (t.rootAlias) tokenMap.get(t.name).aliases[modeName] = t.rootAlias.replace(/\//g, '-')
    }

    for (const t of modeValues.boolean || []) {
      if (!tokenMap.has(t.name)) tokenMap.set(t.name, { type: 'string', values: {}, aliases: {} })
      tokenMap.get(t.name).values[modeName] = String(t.value)
    }
  }

  const tokens = Array.from(tokenMap.entries()).map(([name, data]) => {
    const token = {
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

const tokenFile = {
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString().slice(0, 10),
    source: 'Figma Variables Export',
  },
  collections,
}

const outPath = join(root, 'data', 'tokens.json')
writeFileSync(outPath, JSON.stringify(tokenFile, null, 2), 'utf-8')

const total = collections.reduce((a, c) => a + c.tokens.length, 0)
console.log(`✓ Wrote ${collections.length} collections, ${total} tokens → data/tokens.json`)
collections.forEach((c) => console.log(`  ${c.name}: ${c.tokens.length} tokens [${c.modes.join(', ')}]`))
