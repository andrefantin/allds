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
          <div className="flex justify-center mb-10">
            <svg width="48" height="48" viewBox="0 0 126 126" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M126 0H0V126H126V0Z" fill="black"/>
              <path d="M22.1648 82.046L40.0568 34.6992H51.9098L69.7928 82.046H58.8218L55.3253 72.6972H36.3578L32.8636 82.046H22.1626H22.1648ZM39.7148 63.7535H51.9616L45.8416 47.4117L39.7148 63.7557V63.7535Z" fill="white"/>
              <path d="M69.6377 82.0469V35.9151L79.4612 33.2871V51.6516C80.586 50.0686 82.0715 48.776 83.7947 47.8806C85.6331 46.962 87.6664 46.5019 89.7212 46.5396C93.7959 46.5396 96.9887 47.8604 99.3017 50.5019C101.612 53.1456 102.767 56.7344 102.767 61.2681V82.0469H92.8352V61.8014C92.8352 59.5784 92.3019 57.8436 91.2287 56.6601C90.1532 55.4744 88.5534 54.8736 86.4497 54.8736C85.1609 54.8382 83.8908 55.1871 82.8009 55.8758C81.711 56.5646 80.8508 57.5621 80.3297 58.7414C79.7238 60.0835 79.4255 61.5441 79.4567 63.0164V82.0469H69.6377Z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-[2rem] font-bold text-fics-text">Design Systems</h1>
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
