import type { Metadata } from 'next'
import Link from 'next/link'
import { getSpecials } from '@/lib/data/specials'
import { getSiteSettings } from '@/lib/data/site-settings'
import { SpecialCard } from '@/components/sections/SpecialCard'
import { InstagramSection, instagramSectionFromSettings } from '@/components/sections/InstagramSection'
import { CTABanner } from '@/components/sections/CTABanner'
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
      <section className="border-b border-[#d9ded1] bg-[#f1f3ed] py-5 md:py-6">
        <div className="section-container flex flex-col items-center justify-center gap-4 text-center md:flex-row md:gap-7">
          <p className="max-w-4xl text-sm leading-relaxed text-ink/75 md:text-base">
            Start with a <strong className="font-semibold text-ink">FREE consultation</strong> to assess your skin and receive a professional recommendation. You can also refer a friend, enjoy our current specials and ask family and friends for gift vouchers on special occasions.
          </p>
          <Link href="/book" className="shrink-0 rounded-sm bg-[#87947c] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#74826a]">
            Free Consultation
          </Link>
        </div>
      </section>

      <section className="bg-white py-10 md:py-14">
        <div className="section-container text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">Special Offers</p>
          <h1 className="font-display text-3xl font-light text-ink md:text-4xl">Our Gift To You</h1>
          <div className="mx-auto mt-4 h-px w-12 bg-brand-300" />

          <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-sm shadow-soft">
            <img
              src="/images/share-the-glow-special.svg"
              alt="Share the Glow: 25% off each when you book with a friend on the same day, plus a complimentary neck treatment with facial microneedling."
              className="h-auto w-full"
            />
          </div>

          <Link href="/book" className="mt-7 inline-flex items-center justify-center rounded-sm bg-brand-600 px-8 py-3.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-brand-700">
            Book Appointment
          </Link>
        </div>
      </section>

      {specials.length > 0 && (
        <section className="section-container py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {specials.map(special => <SpecialCard key={special.id} special={special} />)}
          </div>
        </section>
      )}

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
