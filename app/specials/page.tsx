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
  const [specials, settings] = await Promise.all([
    getSpecials(),
    getSiteSettings(),
  ])

  return (
    <>
      <TreatmentHero title="Specials" subtitle="Our gift to you" />

      <section className="bg-white py-16 text-center">
        <div className="section-container">
          <div className="mx-auto max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Limited time</p>
            <h1 className="font-display text-3xl font-light text-ink md:text-4xl">Our Gift To You</h1>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-300" />
            <p className="mt-8 text-base leading-relaxed text-ink/70">
              There are many ways you can treat yourself and save money at the same time. To start
              with, we offer a FREE consultation to assess your skin and make a professional
              recommendation. Once we know what treatment is the most suitable to achieve the
              results you want, you can refer a friend, take advantage of our weekly specials and
              discounted rates available all year round, or even ask family and friends for gift
              vouchers on special occasions. Taking care of yourself doesn&apos;t need to be
              expensive and we&apos;ll do everything possible to make it real for you.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream py-14 md:py-20">
        <div className="section-container">
          <div className="relative mx-auto max-w-3xl overflow-hidden border border-brand-200 bg-[#f7eee8] px-7 py-12 text-center shadow-soft md:px-14 md:py-16">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-brand-200/60" />
            <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full border border-brand-200/50" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.32em] text-brand-600">Naturally Beautiful</p>
            <h2 className="relative mt-4 font-display text-4xl font-light text-ink md:text-5xl">Share the Glow</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">A little something special for you — and someone you love to glow with.</p>

            <div className="relative mx-auto mt-10 grid max-w-2xl gap-5 md:grid-cols-2">
              <div className="bg-white/80 px-6 py-8 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Bring a Friend</p>
                <p className="mt-4 font-display text-3xl text-brand-600">25% off each</p>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">Book a treatment for yourself and a friend on the same day and receive 25% off for each of you.</p>
              </div>
              <div className="bg-white/80 px-6 py-8 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Microneedling Special</p>
                <p className="mt-4 font-display text-3xl text-brand-600">Complimentary neck</p>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">Book a facial microneedling treatment and receive a complimentary neck treatment.</p>
              </div>
            </div>

            <Link href="/book" className="relative mt-9 inline-flex items-center justify-center bg-brand-600 px-8 py-3.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-brand-700">Book your treatment</Link>
          </div>
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
