import Link from 'next/link'
import { getFigmaData } from '@/lib/figma-data.server'
import { getFigmaFoundationData } from '@/lib/figma-foundation.server'
import { getSettings } from '@/lib/settings.server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Libraries' }

interface Props { params: { tenant: string } }

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

interface LibraryCard {
  name: string
  description: string
  href: string
  configured: boolean
}

export default async function LibrariesPage({ params }: Props) {
  const { tenant } = params
  const [figmaData, foundationData, settings] = await Promise.all([
    getFigmaData(tenant),
    getFigmaFoundationData(tenant),
    getSettings(tenant),
  ])

  const totalIcons = (foundationData.iconSets ?? []).reduce((sum, s) => sum + s.icons.length, 0) || foundationData.icons.length

  const coreLibraries: LibraryCard[] = [
    {
      name: 'Foundation',
      description: [
        totalIcons > 0 ? `${totalIcons} icons` : null,
        foundationData.textStyles.length > 0 ? `${foundationData.textStyles.length} text styles` : null,
        foundationData.effectStyles.length > 0 ? `${foundationData.effectStyles.length} effect styles` : null,
      ].filter(Boolean).join(' · ') || 'Tokens, icons, typography and effects',
      href: `/${tenant}/foundation/icons`,
      configured: !!settings.figmaFileFoundation,
    },
    {
      name: 'Components',
      description: figmaData.components.length > 0 ? `${figmaData.components.length} components` : 'UI building blocks',
      href: `/${tenant}/components`,
      configured: !!settings.figmaFileComponents,
    },
    {
      name: 'Modules',
      description: figmaData.modules.length > 0 ? `${figmaData.modules.length} modules` : 'Page-level patterns',
      href: `/${tenant}/modules`,
      configured: !!settings.figmaFileModules,
    },
  ]

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-ds-text mb-2">Libraries</h1>
        <p className="text-body text-ds-text-muted">All Figma libraries connected to this design system.</p>
      </div>

      {coreLibraries.some(l => l.configured) && (
        <div className="mb-8">
          <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-ds-text-muted mb-3">Core</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {coreLibraries.filter(l => l.configured).map((lib) => (
              <Link key={lib.name} href={lib.href} className="card p-5 hover:shadow-card-hover transition-shadow">
                <div className="font-semibold text-ds-text text-[1.4rem] mb-1">{lib.name}</div>
                <div className="text-[1.2rem] text-ds-text-muted">{lib.description}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {figmaData.additionalLibraries.length > 0 && (
        <div>
          <h2 className="text-[1.2rem] font-semibold uppercase tracking-widest text-ds-text-muted mb-3">Additional</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {figmaData.additionalLibraries.map((lib) => (
              <Link key={lib.name} href={`/${tenant}/libraries/${toSlug(lib.name)}`}
                className="card p-5 hover:shadow-card-hover transition-shadow">
                <div className="font-semibold text-ds-text text-[1.4rem] mb-1">{lib.name}</div>
                <div className="text-[1.2rem] text-ds-text-muted">
                  {lib.modules.length > 0 ? `${lib.modules.length} modules` : 'No modules synced yet'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!coreLibraries.some(l => l.configured) && figmaData.additionalLibraries.length === 0 && (
        <div className="card p-8 text-ds-text-muted text-[1.3rem]">
          No libraries configured yet. Go to <Link href={`/${tenant}/settings`} className="text-ds-heading hover:underline">Settings</Link> to connect your Figma files.
        </div>
      )}
    </div>
  )
}
