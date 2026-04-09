import type { Metadata } from 'next'
import { TenantShell } from '@/components/layout/TenantShell'
import { getFigmaData } from '@/lib/figma-data.server'
import { getTenant } from '@/lib/tenant.server'
import { getSettings } from '@/lib/settings.server'
import { getPlatformConfig } from '@/lib/platform-config.server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { tenant: string } }): Promise<Metadata> {
  const [tenantData, settings, platformConfig] = await Promise.all([
    getTenant(params.tenant),
    getSettings(params.tenant),
    getPlatformConfig(),
  ])
  const name = tenantData?.name ?? 'Design System'
  const ogImage = settings.ogImageUrl || platformConfig.defaultOgImageUrl || '/og-default.png'
  return {
    title: { default: name, template: `%s | ${name}` },
    openGraph: {
      title: name,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      images: [ogImage],
    },
  }
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenant: string }
}) {
  const { tenant } = params
  const [figmaData, tenantData, settings] = await Promise.all([
    getFigmaData(tenant),
    getTenant(tenant),
    getSettings(tenant),
  ])

  if (!tenantData) notFound()

  return (
    <TenantShell figmaData={figmaData} tenant={tenant} tenantName={tenantData.name} logoUrl={settings.logoUrl}>
      {children}
    </TenantShell>
  )
}
