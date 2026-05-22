import Link from 'next/link'
import Image from 'next/image'
import { Phone } from 'lucide-react'

interface Props {
  eyebrow?: string
  heading: string
  subheading?: string
  ctaLabel: string
  ctaHref: string
  phone?: string
  heroImageUrl?: string
  heroImageAlt?: string
}

export function HeroSection({
  eyebrow,
  heading,
  subheading,
  ctaLabel,
  ctaHref,
  phone,
  heroImageUrl,
  heroImageAlt,
}: Props) {
  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      {/* Background: Nanobanana image or rose placeholder */}
      <div className="absolute inset-0">
        {heroImageUrl ? (
          <>
            <Image
              src={heroImageUrl}
              alt={heroImageAlt ?? ''}
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/80 to-cream/30" />
          </>
        ) : (
          <div className="hero-placeholder h-full w-full" aria-hidden="true" />
        )}
      </div>

      <div className="section-container relative z-10 flex min-h-[88vh] items-center py-20">
        <div className="max-w-xl animate-slide-up">
          {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
          <h1 className="font-display text-4xl font-light leading-[1.15] tracking-tight text-ink md:text-5xl lg:text-6xl">
            {heading}
          </h1>
          {subheading && (
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted md:text-lg">
              {subheading}
            </p>
          )}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-phone">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {phone}
              </a>
            )}
            <Link href={ctaHref} className="btn-outline">
              {ctaLabel}
            </Link>
          </div>

          <p className="mt-6 text-sm text-ink-faint">
            Free 30-minute consultation · By appointment · Dee Why
          </p>
        </div>
      </div>
    </section>
  )
}
