import Link from 'next/link'
import { Phone } from 'lucide-react'

interface Props {
  heading: string
  body: string
  ctaLabel: string
  ctaHref: string
  phone?: string
}

export function CTABanner({ heading, body, ctaLabel, ctaHref, phone }: Props) {
  return (
    <section className="bg-brand-500 py-16 text-white" aria-labelledby="cta-heading">
      <div className="section-container text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-200">
          Contact us
        </p>
        <h2 id="cta-heading" className="mb-4 font-display text-3xl font-light">
          {heading}
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-brand-100">{body}</p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-none border border-white bg-transparent px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-brand-500"
          >
            {ctaLabel}
          </Link>
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 text-sm font-semibold text-brand-100 hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {phone}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
