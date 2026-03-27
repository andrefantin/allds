export const dynamic = 'force-dynamic'
export const metadata = { title: 'Changelog' }

interface Props { params: { tenant: string } }

export default function ChangelogPage({ params: _ }: Props) {
  return (
    <div className="p-8 max-w-[72rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">Changelog</h1>
        <p className="text-body text-fics-text-muted">Token and component changes over time.</p>
      </div>
      <div className="card p-8">
        <p className="text-body text-fics-text-muted">Changelog entries will appear here.</p>
      </div>
    </div>
  )
}
