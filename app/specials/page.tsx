import type { Metadata } from 'next'
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
  const [specials, settings] = await Promise.all([
    getSpecials(),
    getSiteSettings(),
  ])

  return (
    <>
      <section className="bg-neutral-50 py-20 text-center">
        <div className="section-container">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-500">
            Limited time
          </p>
          <h1 className="section-heading">Our Gift To You</h1>
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
