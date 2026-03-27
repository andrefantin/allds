export const dynamic = 'force-dynamic'
export const metadata = { title: 'How to use' }

interface Props { params: { tenant: string } }

export default function HowToUsePage({ params: _ }: Props) {
  return (
    <div className="p-8 max-w-[72rem] mx-auto">
      <div className="mb-8">
        <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-heading mb-1">Getting Started</p>
        <h1 className="text-heading-lg font-bold text-fics-text mb-2">How to use</h1>
        <p className="text-body text-fics-text-muted max-w-[60rem]">
          Guidelines for using this design system in your projects.
        </p>
      </div>
      <div className="card p-8">
        <p className="text-body text-fics-text-muted">How-to-use content will appear here.</p>
      </div>
    </div>
  )
}
