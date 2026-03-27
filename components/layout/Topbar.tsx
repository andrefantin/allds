'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const isEditor = (session?.user as { role?: string })?.role === 'editor'

  return (
    <header className="h-14 border-b border-fics-border bg-white/60 backdrop-blur-sm sticky top-0 z-30 flex items-center px-6 gap-4">
      {/* Title */}
      {title && (
        <h1 className="text-[1.5rem] font-semibold text-fics-text flex-1">{title}</h1>
      )}
      {!title && <div className="flex-1" />}

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-fics-bg-dark transition-colors text-fics-text-muted hover:text-fics-text"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Role badge */}
        <span className={cn(
          'badge text-[1.1rem]',
          isEditor ? 'badge-new' : 'bg-fics-bg-dark text-fics-text-muted'
        )}>
          {isEditor ? 'Editor' : 'Viewer'}
        </span>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-fics-bg-dark transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-fics-heading flex items-center justify-center text-white text-[1.2rem] font-semibold">
              {session?.user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-[1.3rem] text-fics-text hidden sm:block">
              {session?.user?.email?.split('@')[0]}
            </span>
            <svg className="w-3.5 h-3.5 text-fics-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-card-hover border border-fics-border z-20 py-1 animate-fade-in">
                <div className="px-4 py-2 border-b border-fics-border">
                  <div className="text-[1.3rem] font-medium text-fics-text truncate">{session?.user?.email}</div>
                  <div className="text-[1.1rem] text-fics-text-muted capitalize">{isEditor ? 'Editor' : 'Viewer'}</div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full text-left px-4 py-2 text-[1.3rem] text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
