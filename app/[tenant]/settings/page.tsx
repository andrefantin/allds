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
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const tenant = params.tenant as string
  const isEditor = (session?.user as { role?: string })?.role === 'editor'

  const [settings, setSettings] = useState<Settings>({})
  const [form, setForm] = useState<Settings>({})
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncingFoundation, setSyncingFoundation] = useState(false)
  const [message, setMessage] = useState('')
  const [syncResult, setSyncResult] = useState('')

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
        setSyncResult(`Synced: ${data.icons} icons, ${data.textStyles} text styles, ${data.effectStyles} effect styles.${data.errors?.length ? ' Errors: ' + data.errors.join(', ') : ''}`)
      } else {
        setSyncResult(`Error: ${data.error}`)
      }
    } finally {
      setSyncingFoundation(false)
    }
  }

  if (!isEditor) {
    return (
      <div className="p-8 max-w-[72rem] mx-auto">
        <p className="text-fics-text-muted">Editor access required to view settings.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-[72rem] mx-auto">
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
            <div>
              <label className="block text-[1.2rem] text-fics-text-muted mb-1">Icons Node ID <span className="text-fics-text-muted/60">(optional)</span></label>
              <input
                type="text"
                value={form.figmaIconNodeId || ''}
                onChange={(e) => setForm((f) => ({ ...f, figmaIconNodeId: e.target.value }))}
                placeholder="e.g. 9868:86"
                className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40 font-mono"
              />
              <p className="text-[1.1rem] text-fics-text-muted mt-1">Right-click the icons frame in Figma → Copy/Paste as → Copy link, then extract the node-id parameter.</p>
            </div>
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
