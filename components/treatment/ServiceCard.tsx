import Link from 'next/link'
import Image from 'next/image'
import type { TreatmentCard } from '@/types/database'

interface Props {
  service: TreatmentCard
}

export function ServiceCard({ service }: Props) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col overflow-hidden bg-white shadow-sm ring-1 ring-neutral-100 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
        {service.hero_image ? (
          <Image
            src={service.hero_image}
            alt={service.title}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-brand-200" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-800 group-hover:text-brand-500 transition-colors">
            {service.title}
          </h3>
          {service.price_from != null && (
            <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 ring-1 ring-brand-200">
              from ${service.price_from}
            </span>
          )}
        </div>
        {service.subtitle && (
          <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
            {service.subtitle}
          </p>
        )}
        <span className="mt-3 text-xs font-semibold uppercase tracking-widest text-brand-500 group-hover:underline">
          Learn more →
        </span>
      </div>
    </Link>
  )
}
