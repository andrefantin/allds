'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fics-bg flex items-center justify-center">
      <div className="card p-8 w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-fics-heading flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="text-[2rem] font-bold text-fics-text">AllDS</h1>
          <p className="text-[1.2rem] text-fics-text-muted">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[1.2rem] text-fics-text-muted mb-1">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="viewer@yourds"
              className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
            />
          </div>
          <div>
            <label className="block text-[1.2rem] text-fics-text-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 text-[1.3rem] border border-fics-border rounded-lg bg-white text-fics-text focus:outline-none focus:border-fics-heading/40"
            />
          </div>
          {error && <p className="text-[1.2rem] text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-fics-heading text-white font-semibold rounded-lg hover:bg-fics-heading/90 transition-colors text-[1.3rem] disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
