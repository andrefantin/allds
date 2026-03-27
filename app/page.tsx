import Link from 'next/link'
import { getTenants } from '@/lib/tenant.server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const tenants = await getTenants()

  return (
    <div className="min-h-screen bg-fics-bg">
      <div className="max-w-[80rem] mx-auto px-8 py-16">
        <div className="mb-12">
          <h1 className="text-[3.2rem] font-bold text-fics-text mb-2">AllDS</h1>
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
                  <div className="w-10 h-10 rounded-lg bg-fics-heading flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-base uppercase">{tenant.name.charAt(0)}</span>
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

        <div className="mt-8 text-right">
          <Link href="/admin" className="text-[1.2rem] text-fics-heading hover:underline">
            Manage design systems →
          </Link>
        </div>
      </div>
    </div>
  )
}
