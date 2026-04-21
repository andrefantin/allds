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
  const modules = figmaData.modules.filter((m) => m.status !== 'archived')

  const hasItems = components.length > 0 || modules.length > 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 border-b border-ds-border shrink-0 bg-ds-card">
        <h1 className="text-heading-lg font-bold text-ds-text mb-1">Playground</h1>
        <p className="text-body text-ds-text-muted">
          Explore component and module variants interactively — select properties to see exactly how each variant looks.
        </p>
      </div>

      {!hasItems ? (
        <div className="p-8">
          <div className="card p-8 max-w-[56rem]">
            <p className="text-[1.4rem] font-medium text-ds-text mb-4">Nothing to explore yet</p>
            <ol className="space-y-2 text-[1.3rem] text-ds-text-muted list-none">
              <li><span className="font-mono text-ds-heading mr-2">1.</span>Add your Figma file IDs in <Link href={`/${tenant}/settings`} className="text-ds-heading hover:underline">Settings</Link></li>
              <li><span className="font-mono text-ds-heading mr-2">2.</span>Click <strong className="text-ds-text">Sync from Figma</strong></li>
              <li><span className="font-mono text-ds-heading mr-2">3.</span>Come back here — components and modules will be ready to explore</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <ComponentPlayground components={components} modules={modules} tenant={tenant} />
        </div>
      )}
    </div>
  )
}
