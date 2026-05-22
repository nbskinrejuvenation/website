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
    <section className="relative flex min-h-[55vh] items-end overflow-hidden bg-neutral-900">
      {heroImageUrl && (
        <Image
          src={heroImageUrl}
          alt={title}
          fill
          className="object-cover opacity-50"
          priority
          sizes="100vw"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent" />

      <div className="section-container relative z-10 pb-14 pt-24 text-white">
        {/* Breadcrumb */}
        <nav
          className="mb-6 flex items-center gap-1 text-xs text-neutral-400"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link href="/services" className="hover:text-white transition-colors">Treatments</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-neutral-300" aria-current="page">{title}</span>
        </nav>

        <h1 className="font-display text-3xl font-light md:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-xl text-lg text-neutral-300">{subtitle}</p>
        )}
        <div className="mt-8">
          <Link href="/contact" className="btn-primary text-sm">
            Book Free Consultation
          </Link>
        </div>
      </div>
    </section>
  )
}
