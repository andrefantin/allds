import { getFigmaData } from '@/lib/figma-data.server'
import { ComponentGrid } from '@/components/ui/ComponentGrid'
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
        <h1 className="text-heading-lg font-bold text-ds-text mb-2">Components</h1>
        <p className="text-body text-ds-text-muted">{figmaData.components.length} components</p>
      </div>
      {figmaData.components.length === 0 ? (
        <div className="card p-8">
          <p className="text-[1.4rem] font-medium text-ds-text mb-4">No components synced yet</p>
          <ol className="space-y-2 text-[1.3rem] text-ds-text-muted list-none">
            <li><span className="font-mono text-ds-heading mr-2">1.</span>Add your Components Figma file ID in <Link href={`/${tenant}/settings`} className="text-ds-heading hover:underline">Settings</Link></li>
            <li><span className="font-mono text-ds-heading mr-2">2.</span>Click <strong className="text-ds-text">Sync from Figma</strong></li>
            <li><span className="font-mono text-ds-heading mr-2">3.</span>Come back here — your components will appear</li>
          </ol>
        </div>
      ) : (
        <ComponentGrid items={figmaData.components} tenant={tenant} type="components" columns={4} />
      )}
    </div>
  )
}
