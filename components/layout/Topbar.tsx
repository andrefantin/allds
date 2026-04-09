'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, Sun, Moon, ChevronDown, LogOut } from 'react-feather'

interface TopbarProps {
  title?: string
  onOpenSidebar?: () => void
}

export function Topbar({ title, onOpenSidebar }: TopbarProps) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const userRole = (session?.user as { role?: string })?.role
  const isEditor = userRole === 'editor' || userRole === 'platform_editor'

  return (
    <header className="h-14 border-b border-fics-border bg-white/60 backdrop-blur-sm sticky top-0 z-30 flex items-center px-4 md:px-6 gap-3">
      {/* Hamburger - mobile/tablet only */}
      <button
        onClick={onOpenSidebar}
        className="lg:hidden p-2 rounded-lg hover:bg-fics-bg-dark text-fics-text-muted shrink-0"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

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
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
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
            <ChevronDown size={14} className="text-fics-text-muted" />
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
                  <LogOut size={14} />
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
