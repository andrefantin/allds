import { getFigmaData } from '@/lib/figma-data.server'
import { StatusBadge } from '@/components/ui/StatusBadge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Components' }

interface Props { params: { tenant: string } }

export default async function ComponentsPage({ params }: Props) {
  const { tenant } = params
  const figmaData = await getFigmaData(tenant)

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">Components</h1>
        <p className="text-body text-fics-text-muted">{figmaData.components.length} components</p>
      </div>
      {figmaData.components.length === 0 ? (
        <div className="card p-8 text-fics-text-muted text-[1.3rem]">
          No components synced yet. Go to <Link href={`/${tenant}/settings`} className="text-fics-heading hover:underline">Settings</Link> to sync from Figma.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {figmaData.components.map((comp) => (
            <Link key={comp.slug} href={`/${tenant}/components/${comp.slug}`}
              className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-semibold text-fics-text text-[1.3rem]">{comp.name}</div>
                <StatusBadge status={comp.status} />
              </div>
              <div className="text-[1.2rem] text-fics-text-muted">{comp.group}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
