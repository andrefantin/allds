import { getFigmaData } from '@/lib/figma-data.server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Modules' }

interface Props { params: { tenant: string } }

export default async function ModulesPage({ params }: Props) {
  const { tenant } = params
  const figmaData = await getFigmaData(tenant)

  return (
    <div className="p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">Modules</h1>
        <p className="text-body text-fics-text-muted">{figmaData.modules.length} modules</p>
      </div>
      {figmaData.modules.length === 0 ? (
        <div className="card p-8 text-fics-text-muted text-[1.3rem]">
          No modules synced yet. Go to <Link href={`/${tenant}/settings`} className="text-fics-heading hover:underline">Settings</Link> to sync from Figma.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {figmaData.modules.map((mod) => (
            <Link key={mod.slug} href={`/${tenant}/modules/${mod.slug}`}
              className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-semibold text-fics-text text-[1.3rem]">{mod.name}</div>
                <StatusBadge status={mod.status} />
              </div>
              <div className="text-[1.2rem] text-fics-text-muted">{mod.group}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
