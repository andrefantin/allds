import { getFigmaFoundationData } from '@/lib/figma-foundation.server'
import { IconGrid } from '@/components/foundation/IconGrid'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Icons' }

interface Props { params: { tenant: string } }

export default async function IconsPage({ params }: Props) {
  const { tenant } = params
  const foundation = await getFigmaFoundationData(tenant)
  const { icons } = foundation

  return (
    <div className="p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-heading mb-1">Foundation</p>
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">Icons</h1>
        <p className="text-body text-fics-text-muted max-w-[60rem]">Icon set synced from Figma.</p>
      </div>
      {icons.length === 0 ? (
        <div className="card p-8 flex items-start gap-4 bg-fics-bg/50">
          <div>
            <p className="text-[1.3rem] font-medium text-fics-text">No icons synced yet</p>
            <p className="text-[1.2rem] text-fics-text-muted mt-0.5">
              Add your Foundation Figma File ID in{' '}
              <Link href={`/${tenant}/settings`} className="text-fics-heading hover:underline">Settings</Link>
              {' '}and click <strong>Sync Foundation</strong>.
            </p>
          </div>
        </div>
      ) : (
        <IconGrid icons={icons} />
      )}
    </div>
  )
}
