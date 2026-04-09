import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTenants } from '@/lib/tenant.server'
import { getSettings } from '@/lib/settings.server'
import { getPlatformConfig } from '@/lib/platform-config.server'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPlatformConfig()
  const ogImage = config.defaultOgImageUrl || '/og-default.png'
  return {
    openGraph: { images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter:   { images: [ogImage] },
  }
}

export default async function HomePage() {
  const tenants = await getTenants()
  const settingsMap = Object.fromEntries(
    await Promise.all(tenants.map(async (t) => [t.slug, await getSettings(t.slug)]))
  )

  return (
    <div className="min-h-screen bg-fics-bg">
      <div className="max-w-[80rem] mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="mb-12">
          <h1 className="text-[3.2rem] font-bold text-fics-text mb-2">All Design Systems</h1>
          <p className="text-body text-fics-text-muted">Design system platform — all your systems in one place.</p>
        </div>

        {tenants.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-[1.4rem] text-fics-text-muted mb-4">No design systems yet.</p>
            <Link href="/admin" className="text-fics-heading hover:underline text-[1.3rem]">
              Create your first design system →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenants.map((tenant) => (
              <Link
                key={tenant.slug}
                href={`/${tenant.slug}`}
                className="card p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="rounded-lg shrink-0 overflow-hidden bg-fics-heading flex items-center justify-center"
                    style={{ width: 40, height: 40 }}
                  >
                    {settingsMap[tenant.slug]?.logoUrl
                      ? <Image src={settingsMap[tenant.slug].logoUrl!} alt={tenant.name} width={40} height={40} style={{ width: 40, height: 40, objectFit: 'cover' }} unoptimized />
                      : <span className="text-white font-bold text-base uppercase">{tenant.name.charAt(0)}</span>
                    }
                  </div>
                  <div>
                    <div className="font-bold text-fics-text text-[1.4rem] leading-tight group-hover:text-fics-heading transition-colors">
                      {tenant.name}
                    </div>
                    <div className="text-[1.1rem] text-fics-text-muted">{tenant.slug}</div>
                  </div>
                </div>
                {tenant.description && (
                  <p className="text-[1.2rem] text-fics-text-muted">{tenant.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/admin" className="flex sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-fics-heading text-white text-[1.3rem] font-semibold rounded-lg hover:bg-fics-heading/90 transition-colors">
            Manage design systems
          </Link>
        </div>
      </div>
    </div>
  )
}
