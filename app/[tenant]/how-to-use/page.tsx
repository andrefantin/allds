export const dynamic = 'force-dynamic'
export const metadata = { title: 'How to use' }

interface Props { params: { tenant: string } }

export default function HowToUsePage({ params }: Props) {
  const base = `/${params.tenant}`

  return (
    <div className="p-4 md:p-8 max-w-[72rem] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-heading mb-1">Getting Started</p>
        <h1 className="text-heading-lg font-bold text-fics-text mb-3">How to use</h1>
        <p className="text-body text-fics-text-muted max-w-[60rem]">
          This documentation covers everything available in the design system — from visual foundations to ready-to-use components. Use this page as your starting point.
        </p>
      </div>

      <div className="space-y-8">

        {/* Structure */}
        <section>
          <h2 className="text-heading-sm font-semibold text-fics-text mb-1">How the content is organised</h2>
          <p className="text-body-sm text-fics-text-muted mb-4 max-w-[60rem]">
            The design system is divided into three areas, accessible from the sidebar navigation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5">
              <h3 className="text-[1.4rem] font-semibold text-fics-text mb-2">Foundation</h3>
              <p className="text-body-sm text-fics-text-muted">
                The building blocks of the visual language — colour, typography, spacing, border, elevation, and design tokens. These inform every decision made at the component level.
              </p>
            </div>
            <div className="card p-5">
              <h3 className="text-[1.4rem] font-semibold text-fics-text mb-2">Components</h3>
              <p className="text-body-sm text-fics-text-muted">
                Individual UI elements such as buttons, inputs, and badges. Each component page includes usage guidance, variants, and properties.
              </p>
            </div>
            <div className="card p-5">
              <h3 className="text-[1.4rem] font-semibold text-fics-text mb-2">Modules</h3>
              <p className="text-body-sm text-fics-text-muted">
                Larger, opinionated compositions built from components — things like navigation bars, hero sections, or cards. Modules address a specific layout or interaction pattern.
              </p>
            </div>
          </div>
        </section>

        {/* Foundation */}
        <section>
          <h2 className="text-heading-sm font-semibold text-fics-text mb-1">Foundation</h2>
          <p className="text-body-sm text-fics-text-muted mb-4 max-w-[60rem]">
            Start here before working with components. Understanding the foundation ensures your work stays consistent with the rest of the system.
          </p>
          <div className="card divide-y divide-fics-border">
            {[
              {
                title: 'Colour',
                href: `${base}/foundation/colour`,
                body: 'Browse the full colour palette including primitives and semantic tokens. Semantic tokens carry intent — for example, a surface token describes where something sits in the visual hierarchy, not just what colour it is. Use semantic tokens in your implementations wherever possible.',
              },
              {
                title: 'Colour Accessibility',
                href: `${base}/foundation/colour-accessibility`,
                body: 'Test any two colour tokens against the WCAG 2.2 AA standard (4.5:1 minimum contrast ratio). If a combination fails, the tool suggests the closest passing alternatives from the same token family — preserving either the background or the text colour depending on what you lock.',
              },
              {
                title: 'Typography',
                href: `${base}/foundation/typography`,
                body: 'Type styles used across the system, covering font size, line height, weight, and letter spacing. Applying these styles directly — rather than setting raw values — keeps text hierarchy coherent across the product.',
              },
              {
                title: 'Spacing',
                href: `${base}/foundation/spacing`,
                body: 'The spacing scale defines consistent gaps, padding, and layout rhythm. Spacing values are derived from the token system and should be referenced by name rather than hard-coded pixel values.',
              },
              {
                title: 'Border & Radius',
                href: `${base}/foundation/border`,
                body: 'Border widths and corner radius values used throughout the system. Consistent corner radius reinforces the visual character of the design language.',
              },
              {
                title: 'Elevation',
                href: `${base}/foundation/elevation`,
                body: 'Shadow and elevation levels that communicate depth and layering. Higher elevation values are reserved for elements that appear above the page surface, such as modals and dropdown menus.',
              },
              {
                title: 'Icons',
                href: `${base}/foundation/icons`,
                body: 'The icon library available in the system. Icons can be searched by name. Use the size and colour guidance provided to ensure icons remain legible and consistent across contexts.',
              },
              {
                title: 'Design Tokens',
                href: `${base}/foundation/tokens`,
                body: 'The full token file exported from the design system source. Tokens are structured by collection and mode, allowing values to adapt across themes or platforms. Reference tokens by name in code rather than raw values.',
              },
            ].map(({ title, href, body }) => (
              <div key={title} className="px-5 py-4">
                <a href={href} className="text-[1.4rem] font-semibold text-fics-heading hover:underline">{title}</a>
                <p className="text-body-sm text-fics-text-muted mt-1 max-w-[56rem]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Components and Modules */}
        <section>
          <h2 className="text-heading-sm font-semibold text-fics-text mb-1">Reading a component or module page</h2>
          <p className="text-body-sm text-fics-text-muted mb-4 max-w-[60rem]">
            Each component and module page follows a consistent structure.
          </p>
          <div className="card divide-y divide-fics-border">
            {[
              {
                label: 'Overview',
                body: 'A short description of what the element is, when to use it, and any important constraints or accessibility considerations.',
              },
              {
                label: 'Variants and properties',
                body: 'The configurable options exposed by the component — size, state, appearance. These correspond directly to properties defined in Figma and are kept in sync with the component library.',
              },
              {
                label: 'Usage examples',
                body: 'Visual previews pulled directly from Figma, showing the component in common contexts. These reflect the canonical implementation and should be used as reference.',
              },
              {
                label: 'Status',
                body: 'Each component carries a status label that indicates its readiness for use. See the section below for what each status means.',
              },
            ].map(({ label, body }) => (
              <div key={label} className="px-5 py-4 flex gap-4">
                <span className="text-body-sm font-semibold text-fics-text shrink-0 w-[16rem]">{label}</span>
                <p className="text-body-sm text-fics-text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Status labels */}
        <section>
          <h2 className="text-heading-sm font-semibold text-fics-text mb-1">Component status labels</h2>
          <p className="text-body-sm text-fics-text-muted mb-4 max-w-[60rem]">
            Status labels appear in the sidebar and on component pages. They communicate the current state of each element.
          </p>
          <div className="card divide-y divide-fics-border">
            {[
              {
                label: 'Live',
                color: 'bg-green-100 text-green-700',
                body: 'Stable and ready for use in production. The component has been reviewed, documented, and is actively maintained.',
              },
              {
                label: 'New',
                color: 'bg-amber-100 text-amber-700',
                body: 'Recently added and available for use, but still in the early stages of adoption. Feedback is welcome and the API may evolve.',
              },
              {
                label: 'Testing',
                color: 'bg-blue-100 text-blue-700',
                body: 'Under active evaluation. The component exists and can be used, but may change before reaching a stable state. Check with the design system team before adopting it broadly.',
              },
              {
                label: 'Archived',
                color: 'bg-gray-100 text-gray-500',
                body: 'No longer recommended for new work. Archived components remain visible for reference but are not actively maintained. Migrate to the suggested replacement where one exists.',
              },
            ].map(({ label, color, body }) => (
              <div key={label} className="px-5 py-4 flex items-start gap-4">
                <span className={`badge text-[1rem] px-2 py-0.5 rounded shrink-0 mt-0.5 ${color}`}>{label}</span>
                <p className="text-body-sm text-fics-text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Finding things */}
        <section>
          <h2 className="text-heading-sm font-semibold text-fics-text mb-1">Finding things</h2>
          <p className="text-body-sm text-fics-text-muted mb-4 max-w-[60rem]">
            The sidebar search filters components, modules, and foundation items by name as you type. This is the fastest way to navigate when you know what you are looking for.
          </p>
          <p className="text-body-sm text-fics-text-muted max-w-[60rem]">
            Components and modules are grouped by category. Archived items are collapsed by default and can be expanded from the sidebar if you need to reference legacy work.
          </p>
        </section>

        {/* For developers */}
        <section>
          <h2 className="text-heading-sm font-semibold text-fics-text mb-1">For developers</h2>
          <p className="text-body-sm text-fics-text-muted max-w-[60rem]">
            Design tokens are the primary contract between design and code. When implementing components, reference tokens by their semantic name rather than raw values. This ensures your implementation responds correctly to theming and any future token updates.
          </p>
          <p className="text-body-sm text-fics-text-muted max-w-[60rem] mt-3">
            The token file is available under Foundation → Design Tokens and can be downloaded or accessed programmatically. Token names follow a structured naming convention — consult the token page for the full reference.
          </p>
        </section>

        {/* For designers */}
        <section>
          <h2 className="text-heading-sm font-semibold text-fics-text mb-1">For designers</h2>
          <p className="text-body-sm text-fics-text-muted max-w-[60rem]">
            Component documentation here reflects the source of truth in Figma. If you notice a discrepancy between what is documented and what exists in the Figma library, raise it with the design system team.
          </p>
          <p className="text-body-sm text-fics-text-muted max-w-[60rem] mt-3">
            Before introducing new colour pairings, use the Colour Accessibility checker to confirm the combination meets WCAG 2.2 AA. This is especially important for text on coloured backgrounds.
          </p>
        </section>

      </div>
    </div>
  )
}
