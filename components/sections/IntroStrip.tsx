import Image from 'next/image'
import Link from 'next/link'

interface Props {
  heading?: string
  body?: string
  imageUrl?: string
  imageAlt?: string
  ctaLabel?: string
  ctaHref?: string
}

export function IntroStrip({
  heading = 'We see your natural beauty',
  body = 'Every person has a unique beauty that often gets hidden by our own prejudices. At Naturally Beautiful our focus is to highlight and enhance the stunning features you already have – everyone does.\n\nWe use our years of experience and holistic approach to recommend a treatment that will achieve the best possible results for you to be the best version of yourself.',
  imageUrl,
  imageAlt = 'Natural beauty at Naturally Beautiful Skin Rejuvenation',
  ctaLabel = 'Book a free consultation',
  ctaHref = '/book',
}: Props) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="section-container">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">

          {/* Left: text */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
              Why us
            </p>
            <h2 className="font-display text-3xl font-light leading-snug text-ink md:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <div className="mt-5 h-px w-16 bg-brand-300" />
            <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink/70">
              {body.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <div className="mt-10">
              <Link href={ctaHref} className="btn-primary">
                {ctaLabel}
              </Link>
            </div>
          </div>

          {/* Right: image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt}
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
