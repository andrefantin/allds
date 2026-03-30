'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useParams } from 'next/navigation'
import { TokenTable } from '@/components/tokens/TokenTable'
import { JsonUploader } from '@/components/editor/JsonUploader'
import { formatDate } from '@/lib/utils'
import { searchTokens } from '@/lib/tokens'
import type { TokenFile } from '@/types'

const EMPTY_TOKEN_FILE: TokenFile = {
  metadata: { version: '0.0.0', lastUpdated: '', source: 'empty' },
  collections: [],
}

function normalizeTokenData(data: unknown): TokenFile | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  // Handle old malformed blobs that were wrapped in { tokens: ... }
  const candidate = (d.collections ? d : d.tokens) as Record<string, unknown> | undefined
  if (!candidate) return null
  if (Array.isArray(candidate.collections) && candidate.metadata) {
    return candidate as unknown as TokenFile
  }
  return null
}

export function TokensBrowser() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const params = useParams()
  const tenant = params.tenant as string
  const role = (session?.user as { role?: string })?.role
  const isEditor = role === 'editor' || role === 'platform_editor'

  const [tokens, setTokens] = useState<TokenFile | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [uploaderOpen, setUploaderOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (searchParams.get('upload') === 'true' && isEditor) setUploaderOpen(true)
  }, [searchParams, isEditor])

  function loadTokens() {
    setLoading(true)
    setLoadError(false)
    fetch(`/${tenant}/api/tokens/current`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: unknown) => {
        const normalized = normalizeTokenData(data)
        setTokens(normalized)
        if (!normalized) setLoadError(true)
        setLoading(false)
      })
      .catch(() => {
        setLoadError(true)
        setLoading(false)
      })
  }

  useEffect(() => { loadTokens() }, [tenant]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredCollections = useMemo(() => {
    if (!tokens) return []
    let cols = tokens.collections
    if (activeCollection) cols = cols.filter((c) => c.name === activeCollection)
    if (searchQuery) cols = searchTokens(cols, searchQuery)
    return cols
  }, [tokens, activeCollection, searchQuery])

  const totalFiltered = filteredCollections.reduce((acc, c) => acc + c.tokens.length, 0)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[40vh]">
        <div className="text-fics-text-muted text-body">Loading tokens…</div>
      </div>
    )
  }

  const noTokens = !tokens || tokens.collections.length === 0

  return (
    <>
      <div className="p-8 max-w-[100rem] mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-heading mb-1">Foundation</p>
            <h1 className="text-heading-lg font-bold text-fics-text mb-2">Design Tokens</h1>
            {tokens && !noTokens && (
              <div className="flex items-center gap-3 text-body-sm text-fics-text-muted">
                <span>v{tokens.metadata.version}</span>
                <span>•</span>
                <span>Updated {formatDate(tokens.metadata.lastUpdated)}</span>
                <span>•</span>
                <span>{tokens.collections.reduce((a, c) => a + c.tokens.length, 0)} tokens across {tokens.collections.length} collections</span>
              </div>
            )}
          </div>
          {isEditor && (
            <button
              onClick={() => setUploaderOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-fics-heading text-white font-semibold hover:bg-fics-heading/90 transition-colors shrink-0 text-[1.3rem]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Update Tokens
            </button>
          )}
        </div>

        {noTokens ? (
          <div className="card p-8 flex items-start gap-4 bg-fics-bg/50">
            <div>
              <p className="text-[1.3rem] font-medium text-fics-text">
                {loadError ? 'Could not load token data' : 'No tokens uploaded yet'}
              </p>
              <p className="text-[1.2rem] text-fics-text-muted mt-0.5">
                {isEditor
                  ? 'Upload a JSON file exported from Figma Variables using the button above.'
                  : 'Token data has not been uploaded for this design system yet.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fics-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tokens by name, category, or type…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-fics-border bg-white text-fics-text placeholder:text-fics-text-muted focus:outline-none focus:border-fics-heading/40 focus:ring-2 focus:ring-fics-heading/10 transition-all text-[1.3rem]"
                />
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2 w-max">
                  <button
                    onClick={() => setActiveCollection(null)}
                    className={`px-4 py-2 rounded-lg text-[1.3rem] font-medium transition-colors whitespace-nowrap ${!activeCollection ? 'bg-fics-heading text-white' : 'bg-fics-bg-dark text-fics-text-muted hover:text-fics-text'}`}
                  >
                    All
                  </button>
                  {tokens!.collections.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => setActiveCollection(activeCollection === col.name ? null : col.name)}
                      className={`px-4 py-2 rounded-lg text-[1.3rem] font-medium transition-colors whitespace-nowrap ${activeCollection === col.name ? 'bg-fics-heading text-white' : 'bg-fics-bg-dark text-fics-text-muted hover:text-fics-text'}`}
                    >
                      {col.name.replace(/^[_✅\s]+/, '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {searchQuery && (
              <p className="text-body-sm text-fics-text-muted mb-4">
                {totalFiltered} token{totalFiltered !== 1 ? 's' : ''} matching &quot;{searchQuery}&quot;
              </p>
            )}

            <div className="space-y-8">
              {filteredCollections.map((collection) => (
                <div key={collection.name} className="card">
                  <div className="px-6 py-4 border-b border-fics-border flex items-center gap-3">
                    <h2 className="text-heading-sm font-semibold text-fics-text flex-1">{collection.name.replace(/^[_✅\s]+/, '')}</h2>
                    <span className="text-body-sm text-fics-text-muted">{collection.tokens.length} tokens</span>
                    {collection.modes.length > 1 && (
                      <span className="badge bg-fics-bg text-fics-text-muted border border-fics-border">
                        {collection.modes.join(' · ')}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <TokenTable collection={collection} searchQuery={searchQuery} />
                  </div>
                </div>
              ))}
              {filteredCollections.length === 0 && (
                <div className="card p-12 text-center text-fics-text-muted">
                  No collections match your current filters.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {uploaderOpen && isEditor && (
        <JsonUploader
          tenant={tenant}
          currentTokens={tokens ?? EMPTY_TOKEN_FILE}
          onClose={() => setUploaderOpen(false)}
          onPublished={() => {
            setUploaderOpen(false)
            loadTokens()
          }}
        />
      )}
    </>
  )
}
