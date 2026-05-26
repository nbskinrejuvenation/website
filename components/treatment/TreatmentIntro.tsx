import Image from 'next/image'
import Link from 'next/link'

interface Props {
  subtitle: string
  summary: string
  heroImageUrl?: string
  title: string
}

export function TreatmentIntro({ subtitle, summary, heroImageUrl, title }: Props) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="section-container">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">

          {/* Left: text */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
              {subtitle}
            </p>
            <h2 className="font-display text-3xl font-light leading-snug text-ink md:text-4xl lg:text-5xl">
              {summary}
            </h2>
            <div className="mt-6 h-px w-16 bg-brand-300" />
            <div className="mt-10">
              <Link href="/book" className="btn-primary">
                Book free consultation
              </Link>
            </div>
          </div>

          {/* Right: hero image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-100">
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="hero-placeholder h-full w-full opacity-60" aria-hidden="true" />
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
