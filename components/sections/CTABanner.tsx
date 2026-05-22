import Link from 'next/link'
import { Phone } from 'lucide-react'

interface Props {
  heading: string
  body: string
  ctaLabel: string
  ctaHref: string
  phone?: string
  phonePrimary?: boolean
}

export function CTABanner({
  heading,
  body,
  ctaLabel,
  ctaHref,
  phone,
  phonePrimary = false,
}: Props) {
  return (
    <section
      className="bg-brand-600 py-20 text-cream md:py-24"
      aria-labelledby="cta-heading"
    >
      <div className="section-container text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-brand-200">
          Begin your journey
        </p>
        <h2 id="cta-heading" className="font-display text-3xl font-light md:text-4xl">
          {heading}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-brand-100">{body}</p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {phone && phonePrimary && (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 rounded-sm bg-cream px-8 py-3.5 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-white"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {phone}
            </a>
          )}
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-sm border border-cream/40 bg-transparent px-8 py-3.5 text-sm font-medium tracking-wide text-cream transition-colors hover:border-cream hover:bg-cream/10"
          >
            {ctaLabel}
          </Link>
          {phone && !phonePrimary && (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 text-sm font-medium text-brand-100 transition-colors hover:text-cream"
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
