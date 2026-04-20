'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { Upload, Plus, X } from 'react-feather'
import type { FigmaIconSetConfig, FigmaAdditionalLibrary } from '@/types'

interface Settings {
  figmaToken?: string
  figmaFileComponents?: string
  figmaFileModules?: string
  figmaFileFoundation?: string
  // legacy
  figmaIconNodeId?: string
  figmaIconSetName?: string
  figmaIconNodeId2?: string
  figmaIconSetName2?: string
  ogImageUrl?: string
  logoUrl?: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const tenant = params.tenant as string
  const role = (session?.user as { role?: string })?.role
  const isEditor = role === 'editor' || role === 'platform_editor'

  const [settings, setSettings] = useState<Settings>({})
  const [form, setForm] = useState<Settings>({})
  const [iconSets, setIconSets] = useState<FigmaIconSetConfig[]>([{ name: '', nodeId: '', preserveColors: false }])
  const [additionalLibraries, setAdditionalLibraries] = useState<FigmaAdditionalLibrary[]>([])
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncingFoundation, setSyncingFoundation] = useState(false)
  const [message, setMessage] = useState('')
  const [syncResult, setSyncResult] = useState('')
  const [uploadingOg, setUploadingOg] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    fetch(`/${tenant}/api/settings`)
      .then((r) => r.json())
      .then((data) => {
        setSettings(data)
        setForm({ ...data, figmaToken: '' })

        // Initialise icon sets — prefer new array field, migrate from legacy fields
        if (data.figmaIconSets?.length) {
          setIconSets(data.figmaIconSets)
        } else {
          const sets: FigmaIconSetConfig[] = [
            { name: data.figmaIconSetName || '', nodeId: data.figmaIconNodeId || '', preserveColors: false },
          ]
          if (data.figmaIconNodeId2) {
            sets.push({ name: data.figmaIconSetName2 || '', nodeId: data.figmaIconNodeId2, preserveColors: true })
          }
          setIconSets(sets)
        }

        setAdditionalLibraries(data.figmaAdditionalLibraries || [])
      })
  }, [tenant])

  function updateIconSet(index: number, field: keyof FigmaIconSetConfig, value: string | boolean) {
    setIconSets((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  function removeIconSet(index: number) {
    setIconSets((prev) => prev.filter((_, i) => i !== index))
  }

  function addIconSet() {
    setIconSets((prev) => [...prev, { name: '', nodeId: '', preserveColors: false }])
  }

  function updateAdditionalLibrary(index: number, field: keyof FigmaAdditionalLibrary, value: string) {
    setAdditionalLibraries((prev) => prev.map((l, i) => i === index ? { ...l, [field]: value } : l))
  }

  function removeAdditionalLibrary(index: number) {
    setAdditionalLibraries((prev) => prev.filter((_, i) => i !== index))
  }

  function addAdditionalLibrary() {
    setAdditionalLibraries((prev) => [...prev, { name: '', fileId: '' }])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const payload = {
        ...settings,
        ...(form.figmaToken ? { figmaToken: form.figmaToken } : {}),
        figmaFileComponents: form.figmaFileComponents ?? settings.figmaFileComponents,
        figmaFileModules: form.figmaFileModules ?? settings.figmaFileModules,
        figmaFileFoundation: form.figmaFileFoundation ?? settings.figmaFileFoundation,
        figmaIconSets: iconSets.filter((s) => s.nodeId),
        figmaAdditionalLibraries: additionalLibraries.filter((l) => l.fileId && l.name),
        // Clear legacy fields now that we use the array
        figmaIconNodeId: undefined,
        figmaIconSetName: undefined,
        figmaIconNodeId2: undefined,
        figmaIconSetName2: undefined,
      }

      const res = await fetch(`/${tenant}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setMessage('Settings saved.')
        setForm((f) => ({ ...f, figmaToken: '' }))
      } else {
        setMessage('Failed to save.')
      }
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  async function handleSync() {
    setSyncing(true)
    setSyncResult('')
    try {
      const res = await fetch(`/${tenant}/api/figma/sync`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        const libSummary = data.additionalLibraries?.length
          ? ' · ' + data.additionalLibraries.map((l: { name: string; count: number }) => `${l.name}: ${l.count}`).join(', ')
          : ''
        setSyncResult(`Synced: ${data.components} components, ${data.modules} modules${libSummary}.`)
      } else {
        setSyncResult(`Error: ${data.error}`)
      }
    } finally {
      setSyncing(false)
    }
  }

  async function handleSyncFoundation() {
    setSyncingFoundation(true)
    setSyncResult('')
    try {
      const res = await fetch(`/${tenant}/api/figma/sync-foundation`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        const setsSummary = data.iconSets?.length
          ? data.iconSets.map((s: { name: string; count: number }) => `${s.name}: ${s.count}`).join(', ')
          : `${data.icons} icons`
        const summary = `Icons synced (${setsSummary}) · ${data.textStyles} text styles · ${data.effectStyles} effect styles`
        setSyncResult(data.errors?.length ? `${summary}\nErrors: ${data.errors.join(' | ')}` : summary)
      } else {
        setSyncResult(`Error: ${data.error}`)
      }
    } finally {
      setSyncingFoundation(false)
    }
  }

  if (!isEditor) {
    return (
      <div className="p-4 md:p-8 max-w-[72rem] mx-auto">
        <p className="text-fics-text-muted">Editor access required to view settings.</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-[72rem] mx-auto">
      <div className="mb-8">
        <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-heading mb-1">Settings</p>
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">Configuration</h1>
        <p className="text-body text-fics-text-muted">Configure Figma credentials and sync your design system data.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Figma Credentials */}
        <div className="card p-6">
          <h2 className="text-[1.5rem] font-semibold text-fics-text mb-4">Figma Credentials</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[1.2rem] text-fics-text-muted mb-1">
                Personal Access Token
                {settings.figmaToken === '***' && <span className="ml-2 text-green-600">● Configured</span>}
              </label>
              <input
                type="password"
                value={form.figmaToken || ''}
                onChange={(e) => setForm((f) => ({ ...f, figmaToken: e.target.value }))}
                placeholder={settings.figmaToken === '***' ? 'Leave blank to keep existing' : 'figd_…'}
                className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
              />
              <p className="text-[1.1rem] text-fics-text-muted mt-1">Required scope: files:read, file_content:read</p>
            </div>
          </div>
        </div>

        {/* Components & Modules */}
        <div className="card p-6">
          <h2 className="text-[1.5rem] font-semibold text-fics-text mb-4">Components & Modules</h2>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-[1.2rem] text-fics-text-muted mb-1">Components File ID</label>
              <input
                type="text"
                value={form.figmaFileComponents || ''}
                onChange={(e) => setForm((f) => ({ ...f, figmaFileComponents: e.target.value }))}
                placeholder="Paste the file ID from your Figma URL"
                className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40 font-mono"
              />
            </div>
            <div>
              <label className="block text-[1.2rem] text-fics-text-muted mb-1">Modules File ID</label>
              <input
                type="text"
                value={form.figmaFileModules || ''}
                onChange={(e) => setForm((f) => ({ ...f, figmaFileModules: e.target.value }))}
                placeholder="Paste the file ID from your Figma URL"
                className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40 font-mono"
              />
            </div>

            {/* Additional libraries */}
            {additionalLibraries.map((lib, i) => (
              <div key={i} className="border border-fics-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[1.2rem] font-medium text-fics-text">Additional Library</p>
                  <button
                    type="button"
                    onClick={() => removeAdditionalLibrary(i)}
                    className="text-fics-text-muted hover:text-fics-error transition-colors"
                    aria-label="Remove library"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[1.2rem] text-fics-text-muted mb-1">Library Name</label>
                    <input
                      type="text"
                      value={lib.name}
                      onChange={(e) => updateAdditionalLibrary(i, 'name', e.target.value)}
                      placeholder="e.g. Mobile Components"
                      className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[1.2rem] text-fics-text-muted mb-1">File ID</label>
                    <input
                      type="text"
                      value={lib.fileId}
                      onChange={(e) => updateAdditionalLibrary(i, 'fileId', e.target.value)}
                      placeholder="Paste the file ID from your Figma URL"
                      className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40 font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={addAdditionalLibrary}
              className="flex items-center gap-1.5 text-[1.3rem] text-fics-heading hover:underline"
            >
              <Plus size={13} />
              Add more
            </button>
          </div>

          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="px-5 py-2 bg-fics-heading text-white font-semibold rounded-lg hover:bg-fics-heading/90 transition-colors text-[1.3rem] disabled:opacity-50"
          >
            {syncing ? 'Syncing…' : 'Sync Components & Modules'}
          </button>
        </div>

        {/* Foundation */}
        <div className="card p-6">
          <h2 className="text-[1.5rem] font-semibold text-fics-text mb-4">Foundation</h2>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-[1.2rem] text-fics-text-muted mb-1">Foundation File ID</label>
              <input
                type="text"
                value={form.figmaFileFoundation || ''}
                onChange={(e) => setForm((f) => ({ ...f, figmaFileFoundation: e.target.value }))}
                placeholder="Paste the file ID from your Figma URL"
                className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40 font-mono"
              />
            </div>

            {/* Icon Set 1 — mandatory */}
            <div className="border border-fics-border rounded-lg p-4 space-y-3">
              <p className="text-[1.2rem] font-medium text-fics-text">Icon Set 1</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[1.2rem] text-fics-text-muted mb-1">Label</label>
                  <input
                    type="text"
                    value={iconSets[0]?.name || ''}
                    onChange={(e) => updateIconSet(0, 'name', e.target.value)}
                    placeholder="System icons"
                    className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
                  />
                </div>
                <div>
                  <label className="block text-[1.2rem] text-fics-text-muted mb-1">Node ID <span className="text-fics-text-muted/60">(optional)</span></label>
                  <input
                    type="text"
                    value={iconSets[0]?.nodeId || ''}
                    onChange={(e) => updateIconSet(0, 'nodeId', e.target.value)}
                    placeholder="e.g. 9868:86"
                    className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Additional icon sets */}
            {iconSets.slice(1).map((set, i) => {
              const index = i + 1
              return (
                <div key={index} className="border border-fics-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[1.2rem] font-medium text-fics-text">Icon Set {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeIconSet(index)}
                      className="text-fics-text-muted hover:text-fics-error transition-colors"
                      aria-label="Remove icon set"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[1.2rem] text-fics-text-muted mb-1">Label</label>
                      <input
                        type="text"
                        value={set.name}
                        onChange={(e) => updateIconSet(index, 'name', e.target.value)}
                        placeholder="e.g. Spot Icons"
                        className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[1.2rem] text-fics-text-muted mb-1">Node ID</label>
                      <input
                        type="text"
                        value={set.nodeId}
                        onChange={(e) => updateIconSet(index, 'nodeId', e.target.value)}
                        placeholder="e.g. 1234:5678"
                        className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40 font-mono"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={set.preserveColors ?? false}
                      onChange={(e) => updateIconSet(index, 'preserveColors', e.target.checked)}
                      className="rounded border-fics-border"
                    />
                    <span className="text-[1.2rem] text-fics-text-muted">Preserve original colours</span>
                  </label>
                </div>
              )
            })}

            <p className="text-[1.1rem] text-fics-text-muted">Right-click an icons frame in Figma → Copy link → extract the node-id parameter from the URL.</p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={addIconSet}
              className="flex items-center gap-1.5 text-[1.3rem] text-fics-heading hover:underline"
            >
              <Plus size={13} />
              Add more
            </button>
          </div>

          <button
            type="button"
            onClick={handleSyncFoundation}
            disabled={syncingFoundation}
            className="px-5 py-2 bg-fics-heading text-white font-semibold rounded-lg hover:bg-fics-heading/90 transition-colors text-[1.3rem] disabled:opacity-50"
          >
            {syncingFoundation ? 'Syncing…' : 'Sync Foundation'}
          </button>
        </div>

        {syncResult && (
          <div className="card p-4 text-[1.3rem] text-fics-text bg-fics-bg whitespace-pre-line">{syncResult}</div>
        )}

        {/* OG Image */}
        <div className="card p-6">
          <h2 className="text-[1.5rem] font-semibold text-fics-text mb-1">Social Preview Image</h2>
          <p className="text-[1.2rem] text-fics-text-muted mb-4">OG image shown when this design system is shared on social media. Falls back to the platform default if not set. Recommended size: 1200 × 630px.</p>
          {settings.ogImageUrl && (
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.ogImageUrl}
                alt="Current OG image"
                className="rounded-lg border border-fics-border max-w-[32rem] w-full"
              />
            </div>
          )}
          <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-fics-border bg-white cursor-pointer hover:border-fics-heading/40 transition-colors w-fit ${uploadingOg ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={16} className="text-fics-text-muted shrink-0" />
            <span className="text-[1.3rem] text-fics-text">
              {uploadingOg ? 'Uploading…' : settings.ogImageUrl ? 'Replace image' : 'Upload image'}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploadingOg(true)
                try {
                  const fd = new FormData()
                  fd.append('file', file)
                  const res = await fetch(`/${tenant}/api/og-image`, { method: 'POST', body: fd })
                  const data = await res.json()
                  if (res.ok) setSettings((s) => ({ ...s, ogImageUrl: data.url }))
                  else setMessage(`Upload failed: ${data.error}`)
                } finally {
                  setUploadingOg(false)
                  e.target.value = ''
                }
              }}
            />
          </label>
        </div>

        {/* Logo */}
        <div className="card p-6">
          <h2 className="text-[1.5rem] font-semibold text-fics-text mb-1">Logo</h2>
          <p className="text-[1.2rem] text-fics-text-muted mb-4">Replaces the initial letter avatar in the sidebar and admin panel. Square images work best (e.g. 128 × 128px). PNG, JPG, WebP or SVG.</p>
          {settings.logoUrl && (
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.logoUrl}
                alt="Current logo"
                className="w-16 h-16 rounded-lg border border-fics-border object-cover"
              />
            </div>
          )}
          <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-fics-border bg-white cursor-pointer hover:border-fics-heading/40 transition-colors w-fit ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={16} className="text-fics-text-muted shrink-0" />
            <span className="text-[1.3rem] text-fics-text">
              {uploadingLogo ? 'Uploading…' : settings.logoUrl ? 'Replace logo' : 'Upload logo'}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploadingLogo(true)
                try {
                  const fd = new FormData()
                  fd.append('file', file)
                  const res = await fetch(`/${tenant}/api/logo`, { method: 'POST', body: fd })
                  const data = await res.json()
                  if (res.ok) setSettings((s) => ({ ...s, logoUrl: data.url }))
                  else setMessage(`Upload failed: ${data.error}`)
                } finally {
                  setUploadingLogo(false)
                  e.target.value = ''
                }
              }}
            />
          </label>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-fics-heading text-white font-semibold rounded-lg hover:bg-fics-heading/90 transition-colors text-[1.3rem] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          {message && <span className="text-[1.3rem] text-fics-text-muted">{message}</span>}
        </div>
      </form>
    </div>
  )
}
