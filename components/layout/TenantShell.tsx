'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import type { FigmaComponentsData } from '@/types'

interface TenantShellProps {
  figmaData: FigmaComponentsData
  tenant: string
  tenantName: string
  logoUrl?: string
  children: React.ReactNode
}

export function TenantShell({ figmaData, tenant, tenantName, logoUrl, children }: TenantShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-fics-bg">
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
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  )
}
