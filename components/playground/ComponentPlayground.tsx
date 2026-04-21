'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Search, ExternalLink, Sliders } from 'react-feather'
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

interface Props {
  components: FigmaComponent[]
  tenant: string
}

export function ComponentPlayground({ components, tenant }: Props) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<FigmaComponent | null>(null)
  const [playgroundData, setPlaygroundData] = useState<PlaygroundData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedProps, setSelectedProps] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    if (!search) return components
    return components.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [components, search])

  // Fetch variant data when a component is selected
  useEffect(() => {
    if (!selected) return
    setPlaygroundData(null)
    setSelectedProps({})
    setLoading(true)
    fetch(`/${tenant}/api/figma/playground?componentId=${encodeURIComponent(selected.id)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: PlaygroundData | null) => {
        if (data) {
          setPlaygroundData(data)
          // Set defaults
          const defaults: Record<string, string> = {}
          for (const prop of data.properties) {
            defaults[prop.name] = prop.defaultValue || prop.values[0] || ''
          }
          setSelectedProps(defaults)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selected, tenant])

  // Find the variant node ID that matches current prop selection
  const activeVariant = useMemo(() => {
    if (!playgroundData || !playgroundData.variants.length) return null
    const variantProps = playgroundData.properties.filter((p) => p.type === 'VARIANT')
    if (variantProps.length === 0) return playgroundData.variants[0] || null
    return (
      playgroundData.variants.find((v) =>
        variantProps.every((p) => v.props[p.name] === selectedProps[p.name])
      ) || playgroundData.variants[0]
    )
  }, [playgroundData, selectedProps])

  const embedUrl = useMemo(() => {
    if (!playgroundData) return null
    const nodeId = activeVariant?.nodeId ?? selected?.id
    if (!nodeId) return null
    return `https://www.figma.com/embed?embed_host=ds-platform&url=${encodeURIComponent(
      `https://www.figma.com/file/${playgroundData.fileId}?node-id=${nodeId}`
    )}`
  }, [playgroundData, activeVariant, selected])

  const variantProperties = playgroundData?.properties.filter((p) => p.type === 'VARIANT') ?? []
  const booleanProperties = playgroundData?.properties.filter((p) => p.type === 'BOOLEAN') ?? []

  return (
    <div className="flex h-full gap-0 overflow-hidden">
      {/* Left panel — component list */}
      <div className="w-[26rem] shrink-0 border-r border-ds-border flex flex-col overflow-hidden">
        <div className="p-3 border-b border-ds-border">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ds-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components…"
              className="w-full pl-8 pr-3 py-2 text-[1.3rem] bg-ds-bg-dark border border-ds-border rounded-lg placeholder:text-ds-text-muted text-ds-text focus:outline-none focus:border-ds-heading/30 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-4 text-[1.3rem] text-ds-text-muted">No components found.</p>
          ) : (
            <div className="p-2 space-y-0.5">
              {filtered.map((comp) => (
                <button
                  key={comp.slug}
                  onClick={() => setSelected(comp)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    selected?.slug === comp.slug
                      ? 'bg-ds-heading/10 text-ds-text'
                      : 'hover:bg-ds-bg-dark text-ds-text-muted hover:text-ds-text'
                  }`}
                >
                  {comp.thumbnailUrl ? (
                    <div className="w-10 h-10 shrink-0 rounded border border-ds-border overflow-hidden bg-ds-bg flex items-center justify-center">
                      <Image
                        src={comp.thumbnailUrl}
                        alt={comp.name}
                        width={40}
                        height={40}
                        className="object-contain w-full h-full"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 shrink-0 rounded border border-ds-border bg-ds-bg-dark" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[1.3rem] font-medium truncate">{comp.name}</div>
                    <div className="text-[1.1rem] text-ds-text-muted truncate">{comp.group}</div>
                  </div>
                  <StatusBadge status={comp.status} size="sm" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — configurator */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-ds-text-muted gap-3">
            <Sliders size={36} className="opacity-30" />
            <p className="text-[1.4rem] font-medium">Select a component to configure</p>
            <p className="text-[1.3rem] text-ds-text-muted/60">Choose from the list on the left</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-ds-border flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-[1.6rem] font-bold text-ds-text">{selected.name}</h2>
                <StatusBadge status={selected.status} size="md" />
              </div>
              {selected.figmaUrl && (
                <a
                  href={activeVariant
                    ? selected.figmaUrl.replace(/node-id=[^&]+/, `node-id=${encodeURIComponent(activeVariant.nodeId)}`)
                    : selected.figmaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[1.2rem] text-ds-heading hover:underline shrink-0"
                >
                  Open in Figma <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Controls */}
              {(variantProperties.length > 0 || booleanProperties.length > 0) && (
                <div className="w-[22rem] shrink-0 border-r border-ds-border overflow-y-auto p-5 space-y-6">
                  {loading && (
                    <p className="text-[1.2rem] text-ds-text-muted animate-pulse">Loading variants…</p>
                  )}

                  {variantProperties.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[1.1rem] font-semibold uppercase tracking-widest text-ds-text-muted">Variants</p>
                      {variantProperties.map((prop) => (
                        <div key={prop.name}>
                          <label className="block text-[1.2rem] font-medium text-ds-text mb-2">{prop.name}</label>
                          <div className="flex flex-wrap gap-1.5">
                            {prop.values.map((val) => (
                              <button
                                key={val}
                                onClick={() => setSelectedProps((prev) => ({ ...prev, [prop.name]: val }))}
                                className={`px-3 py-1.5 text-[1.2rem] rounded-md border transition-colors ${
                                  selectedProps[prop.name] === val
                                    ? 'bg-ds-heading text-white border-ds-heading'
                                    : 'bg-ds-bg border-ds-border text-ds-text-muted hover:text-ds-text hover:border-ds-border-strong'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {booleanProperties.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[1.1rem] font-semibold uppercase tracking-widest text-ds-text-muted">Properties</p>
                      {booleanProperties.map((prop) => (
                        <label key={prop.name} className="flex items-center gap-3 cursor-pointer">
                          <div
                            onClick={() =>
                              setSelectedProps((prev) => ({
                                ...prev,
                                [prop.name]: prev[prop.name] === 'true' ? 'false' : 'true',
                              }))
                            }
                            className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                              selectedProps[prop.name] === 'true' ? 'bg-ds-heading' : 'bg-ds-bg-dark border border-ds-border'
                            }`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                              selectedProps[prop.name] === 'true' ? 'translate-x-4' : 'translate-x-0.5'
                            }`} />
                          </div>
                          <span className="text-[1.3rem] text-ds-text">{prop.name}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {!loading && playgroundData && variantProperties.length === 0 && booleanProperties.length === 0 && (
                    <p className="text-[1.2rem] text-ds-text-muted/60 italic">No configurable properties found for this component.</p>
                  )}

                  {!loading && !playgroundData && (
                    <p className="text-[1.2rem] text-ds-text-muted/60 italic">Figma not configured or component has no variants.</p>
                  )}
                </div>
              )}

              {/* Preview */}
              <div className="flex-1 overflow-hidden flex flex-col p-6">
                {loading && !embedUrl ? (
                  <div className="flex-1 rounded-xl border border-ds-border bg-ds-bg animate-pulse" />
                ) : embedUrl ? (
                  <div className="flex-1 rounded-xl overflow-hidden border border-ds-border bg-ds-bg">
                    <iframe
                      key={embedUrl}
                      src={embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title={`${selected.name} preview`}
                    />
                  </div>
                ) : selected.thumbnailUrl ? (
                  <div className="flex-1 rounded-xl border border-ds-border bg-ds-bg flex items-center justify-center overflow-hidden">
                    <Image
                      src={selected.thumbnailUrl}
                      alt={selected.name}
                      width={800}
                      height={600}
                      className="object-contain max-h-full"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex-1 rounded-xl border border-ds-border bg-ds-bg flex items-center justify-center">
                    <p className="text-[1.3rem] text-ds-text-muted">No preview available — connect Figma in Settings</p>
                  </div>
                )}

                {activeVariant && (
                  <p className="mt-3 text-[1.1rem] text-ds-text-muted/60 text-center">
                    {Object.entries(activeVariant.props).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
