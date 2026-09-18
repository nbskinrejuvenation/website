import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  summary?: string
  priceFrom?: number
  packNote?: string
  heroImageUrl?: string
  bookOnlineUrl?: string
  bookOnlineLabel?: string
}

export function TreatmentHero({
  title,
  subtitle,
  summary,
  priceFrom,
  packNote,
  heroImageUrl,
  bookOnlineUrl,
  bookOnlineLabel = 'Book & pay online',
}: Props) {
  // `subtitle` is a short kicker and `summary` the descriptive line. They come from
  // separate columns but on some treatments hold near-identical slogans, so only
  // show the kicker when it actually says something different.
  const showKicker = subtitle && subtitle.trim().toLowerCase() !== summary?.trim().toLowerCase()

  return (
    <section className="relative flex min-h-[60vh] items-end overflow-hidden">
      <div className="absolute inset-0">
        {heroImageUrl ? (
          <>
            <Image
              src={heroImageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent" />
          </>
        ) : (
          <>
            <div className="hero-placeholder h-full w-full opacity-90" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          </>
        )}
      </div>

      <div className="section-container relative z-10 pb-16 pt-28">
        <nav
          className="mb-6 flex items-center gap-1 text-xs text-cream/50"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition-colors hover:text-cream">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link href="/services" className="transition-colors hover:text-cream">
            Treatments
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-cream/80" aria-current="page">
            {title}
          </span>
        </nav>

        {showKicker && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
            {subtitle}
          </p>
        )}

        <h1 className="font-display text-3xl font-light text-cream md:text-4xl lg:text-5xl">
          {title}
        </h1>

        {summary && (
          <p className="mt-4 max-w-xl font-display text-xl font-light leading-snug text-cream/85 md:text-2xl">
            {summary}
          </p>
        )}

        {priceFrom != null && (
          <p className="mt-6 text-sm text-cream/70">
            <span className="font-semibold text-cream">From ${priceFrom}</span>
            {packNote && <span> · {packNote}</span>}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {bookOnlineUrl ? (
            <Link href={bookOnlineUrl} className="btn-primary">
              {bookOnlineLabel}
            </Link>
          ) : null}
          <Link
            href="/book"
            className={bookOnlineUrl ? 'btn-outline border-cream/40 text-cream hover:bg-cream/10' : 'btn-primary'}
          >
            Book free consultation
          </Link>
        </div>
      </div>
    </section>
  )
}
