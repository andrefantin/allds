import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { getFigmaData } from '@/lib/figma-data.server'
import { getTenant } from '@/lib/tenant.server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenant: string }
}) {
  const { tenant } = params
  const [figmaData, tenantData] = await Promise.all([
    getFigmaData(tenant),
    getTenant(tenant),
  ])

  if (!tenantData) notFound()

  return (
    <div className="flex h-screen overflow-hidden bg-fics-bg">
      <Sidebar figmaData={figmaData} tenant={tenant} tenantName={tenantData.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  )
}
