'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Tenant } from '@/types'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isEditor = (session?.user as { role?: string })?.role === 'editor'

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({ slug: '', name: '', description: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    fetch('/api/tenants')
      .then((r) => r.json())
      .then((data) => { setTenants(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.slug || !form.name) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setTenants((prev) => [...prev, data])
      setForm({ slug: '', name: '', description: '' })
      setSuccess(`"${data.name}" created successfully`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(slug)
    try {
      await fetch(`/api/tenants/${slug}`, { method: 'DELETE' })
      setTenants((prev) => prev.filter((t) => t.slug !== slug))
    } catch {
      alert('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  function slugify(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-fics-bg flex items-center justify-center"><p className="text-fics-text-muted">Loading…</p></div>
  }

  if (!isEditor) {
    return (
      <div className="min-h-screen bg-fics-bg flex items-center justify-center">
        <div className="card p-8 text-center max-w-sm">
          <p className="text-[1.4rem] text-fics-text mb-2">Editor access required</p>
          <Link href="/" className="text-fics-heading hover:underline text-[1.3rem]">← Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fics-bg">
      <div className="max-w-[72rem] mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-[1.2rem] text-fics-text-muted hover:text-fics-text mb-2 block">← AllDS</Link>
            <h1 className="text-[2.4rem] font-bold text-fics-text">Manage Design Systems</h1>
          </div>
        </div>

        {/* Create form */}
        <div className="card p-6 mb-8">
          <h2 className="text-[1.6rem] font-semibold text-fics-text mb-4">Create new design system</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[1.2rem] text-fics-text-muted mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="FICS Design System"
                  className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
                  required
                />
              </div>
              <div>
                <label className="block text-[1.2rem] text-fics-text-muted mb-1">Slug (URL identifier)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="fics-design-system"
                  className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40 font-mono"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[1.2rem] text-fics-text-muted mb-1">Description (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="A brief description of this design system"
                className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
              />
            </div>
            {form.slug && (
              <p className="text-[1.2rem] text-fics-text-muted">
                Will be accessible at: <span className="font-mono text-fics-heading">/{form.slug}/</span>
              </p>
            )}
            {error && <p className="text-[1.2rem] text-red-600">{error}</p>}
            {success && <p className="text-[1.2rem] text-green-600">{success}</p>}
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2.5 bg-fics-heading text-white font-semibold rounded-lg hover:bg-fics-heading/90 transition-colors text-[1.3rem] disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create design system'}
            </button>
          </form>
        </div>

        {/* Tenants list */}
        <div className="space-y-3">
          {tenants.length === 0 ? (
            <div className="card p-8 text-center text-fics-text-muted text-[1.3rem]">No design systems yet</div>
          ) : (
            tenants.map((tenant) => (
              <div key={tenant.slug} className="card p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-fics-heading/10 flex items-center justify-center">
                    <span className="text-fics-heading font-bold text-base uppercase">{tenant.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-fics-text text-[1.4rem]">{tenant.name}</div>
                    <div className="text-[1.2rem] text-fics-text-muted font-mono">{tenant.slug}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/${tenant.slug}`}
                    className="px-4 py-1.5 text-[1.2rem] border border-fics-border rounded-lg text-fics-text hover:bg-fics-bg-dark transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/${tenant.slug}/settings`}
                    className="px-4 py-1.5 text-[1.2rem] border border-fics-border rounded-lg text-fics-text hover:bg-fics-bg-dark transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => handleDelete(tenant.slug, tenant.name)}
                    disabled={deleting === tenant.slug}
                    className="px-4 py-1.5 text-[1.2rem] border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deleting === tenant.slug ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
