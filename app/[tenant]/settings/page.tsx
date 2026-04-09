'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'

interface Settings {
  figmaToken?: string
  figmaFileComponents?: string
  figmaFileModules?: string
  figmaFileFoundation?: string
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
      })
  }, [tenant])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const payload: Settings = { ...settings }
      if (form.figmaToken) payload.figmaToken = form.figmaToken
      if (form.figmaFileComponents !== undefined) payload.figmaFileComponents = form.figmaFileComponents
      if (form.figmaFileModules !== undefined) payload.figmaFileModules = form.figmaFileModules
      if (form.figmaFileFoundation !== undefined) payload.figmaFileFoundation = form.figmaFileFoundation
      if (form.figmaIconNodeId !== undefined) payload.figmaIconNodeId = form.figmaIconNodeId
      if (form.figmaIconSetName !== undefined) payload.figmaIconSetName = form.figmaIconSetName
      if (form.figmaIconNodeId2 !== undefined) payload.figmaIconNodeId2 = form.figmaIconNodeId2
      if (form.figmaIconSetName2 !== undefined) payload.figmaIconSetName2 = form.figmaIconSetName2

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
        setSyncResult(`Synced: ${data.components} components, ${data.modules} modules.`)
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
          <div className="space-y-4 mb-6">
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
          <div className="space-y-4 mb-6">
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
            <div className="border border-fics-border rounded-lg p-4 space-y-3">
              <p className="text-[1.2rem] font-medium text-fics-text">Icon Set 1</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[1.2rem] text-fics-text-muted mb-1">Label</label>
                  <input
                    type="text"
                    value={form.figmaIconSetName || ''}
                    onChange={(e) => setForm((f) => ({ ...f, figmaIconSetName: e.target.value }))}
                    placeholder="Icons"
                    className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
                  />
                </div>
                <div>
                  <label className="block text-[1.2rem] text-fics-text-muted mb-1">Node ID <span className="text-fics-text-muted/60">(optional)</span></label>
                  <input
                    type="text"
                    value={form.figmaIconNodeId || ''}
                    onChange={(e) => setForm((f) => ({ ...f, figmaIconNodeId: e.target.value }))}
                    placeholder="e.g. 9868:86"
                    className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40 font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="border border-fics-border rounded-lg p-4 space-y-3">
              <p className="text-[1.2rem] font-medium text-fics-text">Icon Set 2 <span className="text-fics-text-muted/60 font-normal">(optional)</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[1.2rem] text-fics-text-muted mb-1">Label</label>
                  <input
                    type="text"
                    value={form.figmaIconSetName2 || ''}
                    onChange={(e) => setForm((f) => ({ ...f, figmaIconSetName2: e.target.value }))}
                    placeholder="Spot Icons"
                    className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
                  />
                </div>
                <div>
                  <label className="block text-[1.2rem] text-fics-text-muted mb-1">Node ID</label>
                  <input
                    type="text"
                    value={form.figmaIconNodeId2 || ''}
                    onChange={(e) => setForm((f) => ({ ...f, figmaIconNodeId2: e.target.value }))}
                    placeholder="e.g. 1234:5678"
                    className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40 font-mono"
                  />
                </div>
              </div>
            </div>
            <p className="text-[1.1rem] text-fics-text-muted">Right-click an icons frame in Figma → Copy link → extract the node-id parameter from the URL.</p>
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
          <div className="card p-4 text-[1.3rem] text-fics-text bg-fics-bg">{syncResult}</div>
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
            <svg className="w-4 h-4 text-fics-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
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
            <svg className="w-4 h-4 text-fics-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
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
