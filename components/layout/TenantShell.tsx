'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import type { FigmaComponentsData } from '@/types'

interface TenantShellProps {
  figmaData: FigmaComponentsData
  tenant: string
  tenantName: string
  logoUrl?: string
  skillUploadedAt?: string | null
  children: React.ReactNode
}

export function TenantShell({ figmaData, tenant, tenantName, logoUrl, skillUploadedAt, children }: TenantShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Global / shortcut (skip when focus is inside an input/textarea/select)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '/') return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable) return
      e.preventDefault()
      setSearchOpen(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-ds-bg">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        figmaData={figmaData}
        tenant={tenant}
        tenantName={tenantName}
        logoUrl={logoUrl}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
        skillUploadedAt={skillUploadedAt ?? null}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
          {children}
        </main>
      </div>

      <GlobalSearch
        tenant={tenant}
        figmaData={figmaData}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  )
}
