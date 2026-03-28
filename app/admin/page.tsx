'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Tenant } from '@/types'

interface UserEntry {
  email: string
  role: 'platform_editor' | 'viewer' | 'editor'
  tenant?: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isPlatformEditor = (session?.user as { role?: string })?.role === 'platform_editor'

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [users, setUsers] = useState<UserEntry[]>([])
  const [loading, setLoading] = useState(true)

  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [creatingUser, setCreatingUser] = useState(false)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)

  const [tenantForm, setTenantForm] = useState({ slug: '', name: '', description: '' })
  const [userForm, setUserForm] = useState({ email: '', password: '', role: 'viewer', tenant: '' })

  const [tenantError, setTenantError] = useState('')
  const [tenantSuccess, setTenantSuccess] = useState('')
  const [userError, setUserError] = useState('')
  const [userSuccess, setUserSuccess] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (!isPlatformEditor) return
    Promise.all([
      fetch('/api/tenants').then((r) => r.json()),
      fetch('/api/users').then((r) => r.json()),
    ]).then(([t, u]) => {
      setTenants(Array.isArray(t) ? t : [])
      setUsers(Array.isArray(u) ? u : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [isPlatformEditor])

  function slugify(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setTenantError('')
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setTenants((prev) => [...prev, data])
      setTenantForm({ slug: '', name: '', description: '' })
      setTenantSuccess(`"${data.name}" created`)
      setTimeout(() => setTenantSuccess(''), 3000)
    } catch (err) {
      setTenantError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteTenant(slug: string, name: string) {
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

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setCreatingUser(true)
    setUserError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
          tenant: userForm.role === 'platform_editor' ? undefined : userForm.tenant || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setUsers((prev) => [...prev, data])
      setUserForm({ email: '', password: '', role: 'viewer', tenant: '' })
      setUserSuccess(`User "${data.email}" added`)
      setTimeout(() => setUserSuccess(''), 3000)
    } catch (err) {
      setUserError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setCreatingUser(false)
    }
  }

  async function handleDeleteUser(email: string) {
    if (!confirm(`Remove user "${email}"?`)) return
    setDeletingUser(email)
    try {
      await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setUsers((prev) => prev.filter((u) => u.email !== email))
    } catch {
      alert('Failed to remove user')
    } finally {
      setDeletingUser(null)
    }
  }

  const roleBadgeClass: Record<string, string> = {
    platform_editor: 'bg-fics-heading/10 text-fics-heading',
    editor: 'bg-amber-100 text-amber-700',
    viewer: 'bg-gray-100 text-gray-600',
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-fics-bg flex items-center justify-center"><p className="text-fics-text-muted">Loading…</p></div>
  }

  if (!isPlatformEditor) {
    return (
      <div className="min-h-screen bg-fics-bg flex items-center justify-center">
        <div className="card p-8 text-center max-w-sm">
          <p className="text-[1.4rem] text-fics-text mb-2">Platform editor access required</p>
          <Link href="/" className="text-fics-heading hover:underline text-[1.3rem]">← Back</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fics-bg">
      <div className="max-w-[72rem] mx-auto px-8 py-12 space-y-12">
        <div>
          <Link href="/" className="text-[1.2rem] text-fics-text-muted hover:text-fics-text mb-2 block">← AllDS</Link>
          <h1 className="text-[2.4rem] font-bold text-fics-text">Platform Admin</h1>
        </div>

        {/* ── Design Systems ─────────────────────────────── */}
        <section>
          <h2 className="text-[1.8rem] font-semibold text-fics-text mb-4">Design Systems</h2>

          <div className="card p-6 mb-4">
            <h3 className="text-[1.4rem] font-semibold text-fics-text mb-4">Create new</h3>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[1.2rem] text-fics-text-muted mb-1">Name</label>
                  <input
                    type="text"
                    value={tenantForm.name}
                    onChange={(e) => setTenantForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                    placeholder="FICS Design System"
                    className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[1.2rem] text-fics-text-muted mb-1">Slug</label>
                  <input
                    type="text"
                    value={tenantForm.slug}
                    onChange={(e) => setTenantForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                    placeholder="fics"
                    className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40 font-mono"
                    required
                  />
                </div>
              </div>
              <input
                type="text"
                value={tenantForm.description}
                onChange={(e) => setTenantForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
              />
              {tenantForm.slug && (
                <p className="text-[1.2rem] text-fics-text-muted">URL: <span className="font-mono text-fics-heading">/{tenantForm.slug}/</span></p>
              )}
              {tenantError && <p className="text-[1.2rem] text-red-600">{tenantError}</p>}
              {tenantSuccess && <p className="text-[1.2rem] text-green-600">{tenantSuccess}</p>}
              <button type="submit" disabled={creating} className="px-6 py-2.5 bg-fics-heading text-white font-semibold rounded-lg hover:bg-fics-heading/90 transition-colors text-[1.3rem] disabled:opacity-50">
                {creating ? 'Creating…' : 'Create'}
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {tenants.length === 0 ? (
              <div className="card p-6 text-center text-fics-text-muted text-[1.3rem]">No design systems yet</div>
            ) : tenants.map((tenant) => (
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
                  <Link href={`/${tenant.slug}`} className="px-4 py-1.5 text-[1.2rem] border border-fics-border rounded-lg text-fics-text hover:bg-fics-bg-dark transition-colors">View</Link>
                  <Link href={`/${tenant.slug}/settings`} className="px-4 py-1.5 text-[1.2rem] border border-fics-border rounded-lg text-fics-text hover:bg-fics-bg-dark transition-colors">Settings</Link>
                  <button onClick={() => handleDeleteTenant(tenant.slug, tenant.name)} disabled={deleting === tenant.slug} className="px-4 py-1.5 text-[1.2rem] border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                    {deleting === tenant.slug ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Users ──────────────────────────────────────── */}
        <section>
          <h2 className="text-[1.8rem] font-semibold text-fics-text mb-4">Users</h2>

          <div className="card p-6 mb-4">
            <h3 className="text-[1.4rem] font-semibold text-fics-text mb-4">Add user</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[1.2rem] text-fics-text-muted mb-1">Login</label>
                  <input
                    type="text"
                    value={userForm.email}
                    onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="viewer@fics"
                    className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[1.2rem] text-fics-text-muted mb-1">Password</label>
                  <input
                    type="text"
                    value={userForm.password}
                    onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Temporary password"
                    className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[1.2rem] text-fics-text-muted mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="platform_editor">Platform Editor</option>
                  </select>
                </div>
                {userForm.role !== 'platform_editor' && (
                  <div>
                    <label className="block text-[1.2rem] text-fics-text-muted mb-1">Design system</label>
                    <select
                      value={userForm.tenant}
                      onChange={(e) => setUserForm((f) => ({ ...f, tenant: e.target.value }))}
                      className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
                      required
                    >
                      <option value="">Select…</option>
                      {tenants.map((t) => (
                        <option key={t.slug} value={t.slug}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              {userError && <p className="text-[1.2rem] text-red-600">{userError}</p>}
              {userSuccess && <p className="text-[1.2rem] text-green-600">{userSuccess}</p>}
              <button type="submit" disabled={creatingUser} className="px-6 py-2.5 bg-fics-heading text-white font-semibold rounded-lg hover:bg-fics-heading/90 transition-colors text-[1.3rem] disabled:opacity-50">
                {creatingUser ? 'Adding…' : 'Add user'}
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {users.length === 0 ? (
              <div className="card p-6 text-center text-fics-text-muted text-[1.3rem]">
                No users in registry — the platform admin is set via environment variables.
              </div>
            ) : users.map((user) => (
              <div key={user.email} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[1.3rem] text-fics-text">{user.email}</span>
                  <span className={`badge text-[1rem] px-2 py-0.5 rounded-full ${roleBadgeClass[user.role] || 'bg-gray-100 text-gray-600'}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                  {user.tenant && (
                    <span className="text-[1.2rem] text-fics-text-muted">→ <span className="font-mono">{user.tenant}</span></span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteUser(user.email)}
                  disabled={deletingUser === user.email}
                  className="px-3 py-1 text-[1.2rem] border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deletingUser === user.email ? 'Removing…' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
