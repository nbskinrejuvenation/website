import type { PricingGroup } from '@/lib/treatment/parse-pricing'

interface Props {
  groups: PricingGroup[]
}

export function TreatmentPricing({ groups }: Props) {
  return (
    <section className="bg-brand-800 py-20">
      <div className="section-container">

        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
            What we offer
          </p>
          <h2 className="font-display text-4xl font-light text-white md:text-5xl">
            Prices
          </h2>
          <div className="mx-auto mt-5 h-px w-16 bg-brand-500" />
        </div>

        {/* Pricing groups — 1 column on mobile, up to 2 on desktop */}
        <div className={`grid gap-12 md:gap-16 ${groups.length > 1 ? 'md:grid-cols-2' : 'md:max-w-lg md:mx-auto'}`}>
          {groups.map(group => (
            <div key={group.name}>
              {/* Group heading */}
              <h3 className="mb-6 font-display text-2xl font-light text-white">
                {group.name}
              </h3>

              {/* Items */}
              <ul className="space-y-5">
                {group.items.map((item, i) => (
                  <li key={i}>
                    {/* Label ··· Price row */}
                    <div className="flex items-baseline gap-3">
                      <span className="font-semibold text-white">
                        {item.label}
                      </span>
                      {/* Dotted leader line */}
                      <span
                        className="min-w-0 flex-1 self-end"
                        style={{
                          borderBottom: '2px dotted rgba(255,255,255,0.25)',
                          marginBottom: '3px',
                        }}
                        aria-hidden
                      />
                      <span className="shrink-0 text-lg font-bold text-white">
                        {item.price}
                      </span>
                    </div>

                    {/* Subtitle */}
                    {item.subtitle && (
                      <p className="mt-1 text-sm text-brand-200">
                        {item.subtitle}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
