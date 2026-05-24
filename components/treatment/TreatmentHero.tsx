import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  heroImageUrl?: string
}

export function TreatmentHero({ title, subtitle, heroImageUrl }: Props) {
  return (
    <section className="relative flex min-h-[50vh] items-end overflow-hidden">
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
          <div className="hero-placeholder h-full w-full opacity-90" aria-hidden="true" />
        )}
        {!heroImageUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        )}
      </div>

      <div className="section-container relative z-10 pb-14 pt-28">
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

        <h1 className="font-display text-3xl font-light text-cream md:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-xl text-lg text-cream/75">{subtitle}</p>
        )}
        <div className="mt-8">
          <Link href="/book" className="btn-primary">
            Book free consultation
          </Link>
        </div>
      </div>
    </section>
  )
}
