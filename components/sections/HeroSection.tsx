import Link from 'next/link'
import Image from 'next/image'

interface Props {
  eyebrow?: string
  heading: string
  ctaLabel: string
  ctaHref: string
  heroImageUrl?: string
  heroImageAlt?: string
}

export function HeroSection({ eyebrow, heading, ctaLabel, ctaHref, heroImageUrl, heroImageAlt }: Props) {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-neutral-900">
      {heroImageUrl && (
        <Image
          src={heroImageUrl}
          alt={heroImageAlt ?? ''}
          fill
          className="object-cover opacity-50"
          priority
          sizes="100vw"
        />
      )}
      <div className="section-container relative z-10 py-24 text-white">
        {eyebrow && (
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-brand-300">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-2xl font-display text-4xl font-light leading-tight md:text-5xl lg:text-6xl">
          {heading}
        </h1>
        <div className="mt-10">
          <Link href={ctaHref} className="btn-primary text-sm">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
