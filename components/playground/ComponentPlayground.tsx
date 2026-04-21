'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ExternalLink, ChevronDown } from 'react-feather'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { FigmaComponent } from '@/types'

interface Property {
  name: string
  type: string
  values: string[]
  defaultValue?: string
}

interface Variant {
  nodeId: string
  props: Record<string, string>
}

interface PlaygroundData {
  fileId: string
  properties: Property[]
  variants: Variant[]
}

type ItemType = 'components' | 'modules'

interface Props {
  components: FigmaComponent[]
  modules: FigmaComponent[]
  tenant: string
}

export function ComponentPlayground({ components, modules, tenant }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeType, setActiveType] = useState<ItemType>(
    (searchParams.get('type') as ItemType) || 'components'
  )
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<FigmaComponent | null>(null)
  const [playgroundData, setPlaygroundData] = useState<PlaygroundData | null>(null)
  const [loadingVariants, setLoadingVariants] = useState(false)
  const [selectedProps, setSelectedProps] = useState<Record<string, string>>({})
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [loadingImage, setLoadingImage] = useState(false)
  const imageCache = useRef<Map<string, string>>(new Map())

  const items = activeType === 'components' ? components : modules

  const filtered = useMemo(() => {
    if (!search) return items
    return items.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [items, search])

  // Auto-select from URL params on mount
  useEffect(() => {
    const slug = searchParams.get('slug')
    const type = (searchParams.get('type') as ItemType) || 'components'
    setActiveType(type)
    if (slug) {
      const list = type === 'components' ? components : modules
      const match = list.find((c) => c.slug === slug)
      if (match) setSelected(match)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch variant/property data when selection changes
  useEffect(() => {
    if (!selected) return
    setPlaygroundData(null)
    setSelectedProps({})
    setPreviewImageUrl(selected.thumbnailUrl || null)
    setLoadingVariants(true)

    fetch(`/${tenant}/api/figma/playground?componentId=${encodeURIComponent(selected.id)}&type=${activeType}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: PlaygroundData | null) => {
        if (data) {
          setPlaygroundData(data)
          const defaults: Record<string, string> = {}
          for (const prop of data.properties) {
            if (prop.type === 'VARIANT') {
              defaults[prop.name] = prop.defaultValue || prop.values[0] || ''
            } else if (prop.type === 'BOOLEAN') {
              defaults[prop.name] = prop.defaultValue || 'false'
            }
          }
          setSelectedProps(defaults)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingVariants(false))
  }, [selected, activeType, tenant])

  // Find matching variant node ID for current prop selection
  const activeVariant = useMemo(() => {
    if (!playgroundData?.variants.length) return null
    const variantProps = playgroundData.properties.filter((p) => p.type === 'VARIANT')
    if (variantProps.length === 0) return playgroundData.variants[0] || null
    return (
      playgroundData.variants.find((v) =>
        variantProps.every((p) => v.props[p.name] === selectedProps[p.name])
      ) || playgroundData.variants[0]
    )
  }, [playgroundData, selectedProps])

  // Fetch PNG for active variant from Figma Images API
  const fetchVariantImage = useCallback(async (nodeId: string, fileId: string) => {
    const cacheKey = `${fileId}:${nodeId}`
    if (imageCache.current.has(cacheKey)) {
      setPreviewImageUrl(imageCache.current.get(cacheKey)!)
      return
    }
    setLoadingImage(true)
    try {
      const res = await fetch(
        `/${tenant}/api/figma/playground/image?nodeId=${encodeURIComponent(nodeId)}&fileId=${encodeURIComponent(fileId)}`
      )
      if (res.ok) {
        const { imageUrl } = await res.json()
        imageCache.current.set(cacheKey, imageUrl)
        setPreviewImageUrl(imageUrl)
      }
    } catch { /* keep current image */ }
    finally { setLoadingImage(false) }
  }, [tenant])

  useEffect(() => {
    if (activeVariant && playgroundData) {
      fetchVariantImage(activeVariant.nodeId, playgroundData.fileId)
    }
  }, [activeVariant, playgroundData, fetchVariantImage])

  function selectItem(item: FigmaComponent) {
    setSelected(item)
    router.replace(`/${tenant}/playground?slug=${item.slug}&type=${activeType}`, { scroll: false })
  }

  function switchType(type: ItemType) {
    setActiveType(type)
    setSelected(null)
    setPlaygroundData(null)
    setPreviewImageUrl(null)
    setSearch('')
  }

  const variantProperties = playgroundData?.properties.filter((p) => p.type === 'VARIANT') ?? []
  const booleanProperties = playgroundData?.properties.filter((p) => p.type === 'BOOLEAN') ?? []
  const hasControls = variantProperties.length > 0 || booleanProperties.length > 0

  const figmaUrl = selected?.figmaUrl
    ? activeVariant
      ? selected.figmaUrl.replace(/node-id=[^&]+/, `node-id=${encodeURIComponent(activeVariant.nodeId)}`)
      : selected.figmaUrl
    : null

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: item selector ── */}
      <div className="w-[24rem] shrink-0 border-r border-ds-border flex flex-col overflow-hidden bg-ds-sidebar">

        {/* Type tabs */}
        <div className="flex border-b border-ds-border">
          {(['components', 'modules'] as ItemType[]).map((t) => (
            <button
              key={t}
              onClick={() => switchType(t)}
              className={`flex-1 py-3 text-[1.2rem] font-medium capitalize transition-colors ${
                activeType === t
                  ? 'text-ds-heading border-b-2 border-ds-heading -mb-px'
                  : 'text-ds-text-muted hover:text-ds-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-3 border-b border-ds-border">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ds-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${activeType}…`}
              className="w-full pl-8 pr-3 py-2 text-[1.3rem] bg-ds-bg-dark border border-ds-border rounded-lg placeholder:text-ds-text-muted text-ds-text focus:outline-none focus:border-ds-heading/30 transition-colors"
            />
          </div>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-4 text-[1.3rem] text-ds-text-muted">No results.</p>
          ) : (
            <div className="p-2 space-y-0.5">
              {filtered.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => selectItem(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    selected?.slug === item.slug && activeType === (searchParams.get('type') || 'components')
                      ? 'bg-ds-heading/10 text-ds-text'
                      : 'hover:bg-ds-bg-dark text-ds-text-muted hover:text-ds-text'
                  }`}
                >
                  {item.thumbnailUrl ? (
                    <div className="w-10 h-10 shrink-0 rounded border border-ds-border overflow-hidden bg-white flex items-center justify-center">
                      <Image src={item.thumbnailUrl} alt={item.name} width={40} height={40}
                        className="object-contain w-full h-full" unoptimized />
                    </div>
                  ) : (
                    <div className="w-10 h-10 shrink-0 rounded border border-ds-border bg-ds-bg-dark" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[1.3rem] font-medium truncate text-ds-text">{item.name}</div>
                    <div className="text-[1.1rem] text-ds-text-muted truncate">{item.group}</div>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Center: preview ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f5f5] dark:bg-zinc-800">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-ds-text-muted">
            <div className="w-16 h-16 rounded-2xl bg-ds-bg-dark/50 flex items-center justify-center mb-2">
              <ChevronDown size={28} className="opacity-30 -rotate-90" />
            </div>
            <p className="text-[1.5rem] font-semibold text-ds-text/60">Select a component</p>
            <p className="text-[1.3rem] text-ds-text-muted/50">Choose from the panel on the left</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Preview header */}
            <div className="px-5 py-3 flex items-center justify-between gap-4 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border-b border-ds-border shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-[1.4rem] font-semibold text-ds-text">{selected.name}</span>
                <StatusBadge status={selected.status} size="md" />
                <span className="text-[1.2rem] text-ds-text-muted">· {selected.group}</span>
              </div>
              {figmaUrl && (
                <a href={figmaUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[1.2rem] text-ds-heading hover:underline shrink-0">
                  Open variant in Figma <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Preview canvas */}
            <div className="flex-1 flex items-center justify-center p-10 overflow-hidden relative">
              {loadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#f5f5f5]/70 dark:bg-zinc-800/70 z-10">
                  <div className="w-8 h-8 border-2 border-ds-heading/30 border-t-ds-heading rounded-full animate-spin" />
                </div>
              )}
              {previewImageUrl ? (
                <div className="max-w-full max-h-full overflow-hidden flex items-center justify-center">
                  <img
                    src={previewImageUrl}
                    alt={selected.name}
                    className="max-w-full max-h-full object-contain drop-shadow-xl"
                    style={{ maxHeight: 'calc(100vh - 20rem)' }}
                  />
                </div>
              ) : loadingVariants ? (
                <div className="w-8 h-8 border-2 border-ds-heading/30 border-t-ds-heading rounded-full animate-spin" />
              ) : (
                <p className="text-[1.3rem] text-ds-text-muted/50">No preview available</p>
              )}
            </div>

            {/* Active variant label */}
            {activeVariant && Object.keys(activeVariant.props).length > 0 && (
              <div className="px-5 py-2 border-t border-ds-border/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm shrink-0">
                <p className="text-[1.1rem] text-ds-text-muted text-center">
                  {Object.entries(activeVariant.props).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right: controls ── */}
      {selected && (
        <div className="w-[26rem] shrink-0 border-l border-ds-border flex flex-col overflow-hidden bg-ds-card">
          <div className="px-5 py-4 border-b border-ds-border shrink-0">
            <p className="text-[1.1rem] font-semibold uppercase tracking-widest text-ds-text-muted">Properties</p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {loadingVariants && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-20 bg-ds-bg-dark rounded animate-pulse" />
                    <div className="h-9 w-full bg-ds-bg-dark rounded-lg animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {!loadingVariants && variantProperties.map((prop) => (
              <div key={prop.name}>
                <label className="block text-[1.2rem] font-medium text-ds-text mb-2">{prop.name}</label>
                {prop.values.length <= 5 ? (
                  /* Pill buttons for small option sets */
                  <div className="flex flex-wrap gap-1.5">
                    {prop.values.map((val) => (
                      <button
                        key={val}
                        onClick={() => setSelectedProps((prev) => ({ ...prev, [prop.name]: val }))}
                        className={`px-3 py-1.5 text-[1.2rem] rounded-lg border transition-all ${
                          selectedProps[prop.name] === val
                            ? 'bg-ds-heading text-white border-ds-heading shadow-sm'
                            : 'bg-ds-bg border-ds-border text-ds-text-muted hover:text-ds-text hover:border-ds-border-strong'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Dropdown for large option sets */
                  <div className="relative">
                    <select
                      value={selectedProps[prop.name] || ''}
                      onChange={(e) => setSelectedProps((prev) => ({ ...prev, [prop.name]: e.target.value }))}
                      className="w-full appearance-none pl-3 pr-8 py-2.5 text-[1.3rem] bg-ds-bg border border-ds-border rounded-lg text-ds-text focus:outline-none focus:border-ds-heading/40 transition-colors cursor-pointer"
                    >
                      {prop.values.map((val) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ds-text-muted pointer-events-none" />
                  </div>
                )}
              </div>
            ))}

            {!loadingVariants && booleanProperties.map((prop) => (
              <div key={prop.name} className="flex items-center justify-between">
                <span className="text-[1.3rem] text-ds-text">{prop.name}</span>
                <button
                  onClick={() =>
                    setSelectedProps((prev) => ({
                      ...prev,
                      [prop.name]: prev[prop.name] === 'true' ? 'false' : 'true',
                    }))
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    selectedProps[prop.name] === 'true' ? 'bg-ds-heading' : 'bg-ds-bg-dark border border-ds-border'
                  }`}
                >
                  <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${
                    selectedProps[prop.name] === 'true' ? 'translate-x-[22px]' : 'translate-x-[3px]'
                  }`} />
                </button>
              </div>
            ))}

            {!loadingVariants && !hasControls && playgroundData && (
              <p className="text-[1.2rem] text-ds-text-muted/60 italic">
                This component has no configurable properties.
              </p>
            )}

            {!loadingVariants && !playgroundData && (
              <p className="text-[1.2rem] text-ds-text-muted/60 italic">
                Connect Figma in Settings to enable variant controls.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
