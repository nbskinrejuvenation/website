import Link from 'next/link'
import Image from 'next/image'
import type { TreatmentCard } from '@/types/database'

interface Props {
  services: TreatmentCard[]
  heading?: string
  subheading?: string
  showViewAll?: boolean
}

export function TreatmentsGrid({
  services,
  heading = 'Our treatments',
  subheading,
  showViewAll = false,
}: Props) {
  if (services.length === 0) return null

  return (
    <section className="bg-cream py-20 md:py-24" aria-labelledby="treatments-heading">
      <div className="section-container">
        <div className="mb-14 text-center">
          <p className="eyebrow mb-3">Face & body</p>
          <h2 id="treatments-heading" className="section-heading">
            {heading}
          </h2>
          {subheading && (
            <p className="mx-auto mt-4 max-w-lg text-ink-muted">{subheading}</p>
          )}
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(service => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group flex flex-col overflow-hidden rounded-sm bg-white shadow-card ring-1 ring-sand-dark/40 transition-all duration-300 hover:shadow-soft hover:ring-brand-200"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {service.hero_image ? (
                  <Image
                    src={service.hero_image}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      service.category === 'body'
                        ? 'from-brand-100 via-cream-dark to-brand-200/80'
                        : 'from-brand-50 via-brand-100 to-brand-200/60'
                    }`}
                    aria-hidden="true"
                  />
                )}
                <span className="absolute left-3 top-3 rounded-sm bg-cream/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-brand-700">
                  {service.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-light text-ink transition-colors group-hover:text-brand-600">
                  {service.title}
                </h3>
                {service.subtitle && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted line-clamp-2">
                    {service.subtitle}
                  </p>
                )}
                <span className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-brand-600">
                  Discover →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {showViewAll && (
          <div className="mt-12 text-center">
            <Link href="/services" className="btn-outline">
              View all treatments
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
