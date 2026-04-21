import { getFigmaData } from '@/lib/figma-data.server'
import { ComponentGrid } from '@/components/ui/ComponentGrid'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Modules' }

interface Props { params: { tenant: string } }

export default async function ModulesPage({ params }: Props) {
  const { tenant } = params
  const figmaData = await getFigmaData(tenant)

  return (
    <div className="p-4 md:p-8 max-w-[96rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-ds-text mb-2">Modules</h1>
        <p className="text-body text-ds-text-muted">{figmaData.modules.length} modules</p>
      </div>
      {figmaData.modules.length === 0 ? (
        <div className="card p-8">
          <p className="text-[1.4rem] font-medium text-ds-text mb-4">No modules synced yet</p>
          <ol className="space-y-2 text-[1.3rem] text-ds-text-muted list-none">
            <li><span className="font-mono text-ds-heading mr-2">1.</span>Add your Modules Figma file ID in <Link href={`/${tenant}/settings`} className="text-ds-heading hover:underline">Settings</Link></li>
            <li><span className="font-mono text-ds-heading mr-2">2.</span>Click <strong className="text-ds-text">Sync from Figma</strong></li>
            <li><span className="font-mono text-ds-heading mr-2">3.</span>Come back here — your modules will appear</li>
          </ol>
        </div>
      ) : (
        <ComponentGrid items={figmaData.modules} tenant={tenant} type="modules" columns={3} />
      )}
    </div>
  )
}
