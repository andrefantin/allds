import { getFigmaData } from '@/lib/figma-data.server'
import { ComponentPlayground } from '@/components/playground/ComponentPlayground'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Playground' }

interface Props { params: { tenant: string } }

export default async function PlaygroundPage({ params }: Props) {
  const { tenant } = params
  const figmaData = await getFigmaData(tenant)
  const components = figmaData.components.filter((c) => c.status !== 'archived')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="px-6 py-5 border-b border-ds-border shrink-0">
        <h1 className="text-heading-lg font-bold text-ds-text mb-1">Playground</h1>
        <p className="text-body text-ds-text-muted">
          Select a component, configure its variants, and preview it live from Figma.
        </p>
      </div>

      {components.length === 0 ? (
        <div className="p-8">
          <div className="card p-8">
            <p className="text-[1.4rem] font-medium text-ds-text mb-4">No components to explore yet</p>
            <ol className="space-y-2 text-[1.3rem] text-ds-text-muted list-none">
              <li><span className="font-mono text-ds-heading mr-2">1.</span>Add your Components Figma file ID in <Link href={`/${tenant}/settings`} className="text-ds-heading hover:underline">Settings</Link></li>
              <li><span className="font-mono text-ds-heading mr-2">2.</span>Click <strong className="text-ds-text">Sync from Figma</strong></li>
              <li><span className="font-mono text-ds-heading mr-2">3.</span>Come back here to configure variants</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <ComponentPlayground components={components} tenant={tenant} />
        </div>
      )}
    </div>
  )
}
