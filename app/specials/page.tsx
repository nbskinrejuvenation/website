import type { Metadata } from 'next'
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
              Limited time
            </p>
            <h1 className="font-display text-3xl font-light text-ink md:text-4xl">
              Our Gift To You
            </h1>
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

      <section className="section-container py-16">
        {specials.length === 0 ? (
          <p className="text-center text-neutral-500">
            No current specials. Check back soon or follow us on Instagram for the latest.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {specials.map(special => (
              <SpecialCard key={special.id} special={special} />
            ))}
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
