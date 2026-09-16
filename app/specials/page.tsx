import type { Metadata } from 'next'
import Link from 'next/link'
import { getSpecials } from '@/lib/data/specials'
import { getSiteSettings } from '@/lib/data/site-settings'
import { SpecialCard } from '@/components/sections/SpecialCard'
import { InstagramSection, instagramSectionFromSettings } from '@/components/sections/InstagramSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { TreatmentHero } from '@/components/treatment/TreatmentHero'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'

const description =
  'Exclusive offers and weekly specials at Naturally Beautiful Skin Rejuvenation. Free consultations, refer-a-friend rewards, and pack pricing.'

export const metadata: Metadata = {
  title: pageTitle('Specials & Offers'),
  description,
  openGraph: openGraphDefaults('Specials & Offers', description),
  alternates: { canonical: '/specials' },
}

export default async function SpecialsPage() {
  const [specials, settings] = await Promise.all([getSpecials(), getSiteSettings()])

  return (
    <>
      <TreatmentHero title="Specials" subtitle="Our gift to you" />

      <section className="bg-cream py-12 md:py-16">
        <div className="section-container text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Limited time</p>
          <h1 className="font-display text-3xl font-light text-ink md:text-4xl">Our Gift To You</h1>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-300" />

          <div className="mx-auto mt-9 max-w-2xl overflow-hidden shadow-soft">
            <img
              src="/images/share-the-glow-special.svg"
              alt="Share the Glow: 25% off each when you book with a friend on the same day, plus a complimentary neck treatment with facial microneedling."
              className="h-auto w-full"
            />
          </div>

          <Link href="/book" className="mt-8 inline-flex items-center justify-center bg-brand-600 px-8 py-3.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-brand-700">
            Book your treatment
          </Link>
        </div>
      </section>

      <section className="bg-white py-14 text-center">
        <div className="section-container">
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-ink/70">
            Start with a FREE consultation to assess your skin and receive a professional recommendation. You can also refer a friend, enjoy our current specials and ask family and friends for gift vouchers on special occasions.
          </p>
        </div>
      </section>

      <section className="section-container py-16">
        {specials.length === 0 ? (
          <p className="text-center text-neutral-500">No other current specials. Check back soon or follow us on Instagram for the latest.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {specials.map(special => <SpecialCard key={special.id} special={special} />)}
          </div>
        )}
      </section>

      <InstagramSection {...instagramSectionFromSettings(settings)} />

      <CTABanner
        heading="Book your free consultation"
        body="Ready to treat yourself? Book a free consultation and discover which treatment is right for you."
        ctaLabel="Book Now"
        ctaHref="/book"
        phone={settings.phone ?? undefined}
      />
    </>
  )
}
