'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import type { FigmaComponentsData } from '@/types'

interface SidebarProps {
  figmaData: FigmaComponentsData
  tenant: string
  tenantName: string
}

interface NavItem {
  label: string
  href: string
  status?: string
}

interface NavSection {
  title: string
  items: NavItem[]
  isExpandable?: boolean
  defaultExpanded?: boolean
}

export function Sidebar({ figmaData, tenant, tenantName }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user as { role?: string })?.role
  const isEditor = userRole === 'editor' || userRole === 'platform_editor'
  const base = `/${tenant}`

  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const staticSections: NavSection[] = [
    {
      title: 'Getting Started',
      items: [
        { label: 'Introduction', href: `${base}` },
        { label: 'How to use', href: `${base}/how-to-use` },
      ],
    },
    {
      title: 'Foundation',
      items: [
        { label: 'Border & Radius', href: `${base}/foundation/border` },
        { label: 'Colour', href: `${base}/foundation/colour` },
        { label: 'Design Tokens', href: `${base}/foundation/tokens` },
        { label: 'Elevation', href: `${base}/foundation/elevation` },
        { label: 'Icons', href: `${base}/foundation/icons` },
        { label: 'Spacing', href: `${base}/foundation/spacing` },
        { label: 'Typography', href: `${base}/foundation/typography` },
      ],
    },
  ]

  const componentSections: NavSection[] = figmaData.navigation.components.map((group) => ({
    title: group.group,
    items: group.items.map((item) => ({
      label: item.name,
      href: `${base}/components/${item.slug}`,
      status: item.status,
    })),
    isExpandable: true,
    defaultExpanded: true,
  }))

  const moduleSections: NavSection[] = figmaData.navigation.modules.map((group) => ({
    title: group.group,
    items: group.items.map((item) => ({
      label: item.name,
      href: `${base}/modules/${item.slug}`,
      status: item.status,
    })),
    isExpandable: true,
    defaultExpanded: true,
  }))

  const editorSection: NavSection = {
    title: 'Editor Tools',
    items: [
      { label: 'Update Tokens', href: `${base}/foundation/tokens?upload=true` },
      { label: 'Sync from Figma', href: `${base}/settings` },
      { label: 'Changelog', href: `${base}/changelog` },
      { label: 'Settings', href: `${base}/settings` },
      { label: 'All design systems', href: '/admin' },
    ],
  }

  function isActive(href: string) {
    const cleanHref = href.split('?')[0]
    if (cleanHref === base) return pathname === base || pathname === `${base}/`
    return pathname.startsWith(cleanHref)
  }

  function toggleSection(title: string) {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const filterItems = (items: NavItem[]) => {
    if (!search) return items
    return items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
  }

  const statusColors: Record<string, string> = {
    stable: 'bg-green-100 text-green-700',
    beta: 'bg-blue-100 text-blue-700',
    new: 'bg-amber-100 text-amber-700',
    deprecated: 'bg-gray-100 text-gray-500',
  }

  const renderSection = (section: NavSection, prefix?: string) => {
    const key = `${prefix || ''}${section.title}`
    const isCollapsed = collapsed[key] === true
    const items = filterItems(section.items)
    if (search && items.length === 0) return null

    return (
      <div key={key} className="mb-1">
        <button
          onClick={() => section.isExpandable && toggleSection(key)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-1.5 text-left',
            section.isExpandable ? 'cursor-pointer hover:bg-fics-bg-dark/50 rounded-lg' : 'cursor-default'
          )}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-fics-text-muted">
            {section.title}
          </span>
          {section.isExpandable && (
            <svg
              className={cn('w-3 h-3 text-fics-text-muted transition-transform', isCollapsed && '-rotate-90')}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
        {!isCollapsed && (
          <div className="mt-0.5 space-y-0.5">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn('sidebar-link', isActive(item.href) && 'active')}
              >
                <span className="flex-1 text-[1.3rem]">{item.label}</span>
                {item.status && item.status !== 'stable' && (
                  <span className={cn('badge text-[1rem] px-1.5 py-0', statusColors[item.status])}>
                    {item.status}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-[26rem] shrink-0 h-screen sticky top-0 overflow-hidden flex flex-col bg-fics-sidebar border-r border-fics-border">
      {/* Logo */}
      <div className="p-5 border-b border-fics-border">
        <Link href={base} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-fics-heading flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-base uppercase">{tenantName.charAt(0)}</span>
          </div>
          <div>
            <div className="font-bold text-fics-text text-[1.4rem] leading-tight">{tenantName}</div>
            <div className="text-[1.1rem] text-fics-text-muted">Design System</div>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-fics-border">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fics-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full pl-9 pr-3 py-2 text-[1.3rem] bg-white/60 rounded-lg border border-fics-border placeholder:text-fics-text-muted text-fics-text focus:outline-none focus:border-fics-heading/30 transition-colors"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-5">
        {staticSections.map((s) => renderSection(s, 'static-'))}

        <div>
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-fics-text-muted">Components</span>
            <Link href={`${base}/components`} className="text-[1.1rem] text-fics-heading hover:underline">All</Link>
          </div>
          <div className="space-y-4">
            {componentSections.map((s) => renderSection(s, 'comp-'))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-fics-text-muted">Modules</span>
            <Link href={`${base}/modules`} className="text-[1.1rem] text-fics-heading hover:underline">All</Link>
          </div>
          <div className="space-y-4">
            {moduleSections.map((s) => renderSection(s, 'mod-'))}
          </div>
        </div>

        {isEditor && (
          <div className="border-t border-fics-border pt-4">
            {renderSection(editorSection, 'editor-')}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-fics-border">
        <div className="text-[1.1rem] text-fics-text-muted">
          {figmaData.lastSynced
            ? `Last synced ${new Date(figmaData.lastSynced).toLocaleDateString()}`
            : 'Not synced from Figma yet'}
        </div>
      </div>
    </aside>
  )
}
