import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFigmaData } from '@/lib/figma-data.server'
import { StatusBadge } from '@/components/ui/StatusBadge'

export const dynamic = 'force-dynamic'

interface Props { params: { tenant: string; name: string } }

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default async function LibraryPage({ params }: Props) {
  const { tenant, name } = params
  const figmaData = await getFigmaData(tenant)

  const library = figmaData.additionalLibraries.find((lib) => toSlug(lib.name) === name)
  if (!library) notFound()

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-ds-text mb-2">{library.name}</h1>
        <p className="text-body text-ds-text-muted">{library.modules.length} modules</p>
      </div>
      {library.modules.length === 0 ? (
        <div className="card p-8 text-ds-text-muted text-[1.3rem]">
          No modules synced yet. Go to <Link href={`/${tenant}/settings`} className="text-ds-heading hover:underline">Settings</Link> to sync from Figma.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {library.modules.map((mod) => (
            <Link key={mod.slug} href={`/${tenant}/modules/${mod.slug}`}
              className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-semibold text-ds-text text-[1.3rem]">{mod.name}</div>
                <StatusBadge status={mod.status} />
              </div>
              <div className="text-[1.2rem] text-ds-text-muted">{mod.group}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
