import { Suspense } from 'react'
import { TokensBrowser } from './TokensBrowser'

export const dynamic = 'force-dynamic'

export default function TokensPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ds-text-muted">Loading tokens…</div>}>
      <TokensBrowser />
    </Suspense>
  )
}
