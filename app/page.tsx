import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/data/site-settings'
import { getHomepageFeaturedServices } from '@/lib/data/homepage'
import { getTestimonialsByPage } from '@/lib/data/testimonials'
import { Reveal } from '@/components/motion/Reveal'
import { HeroSection } from '@/components/sections/HeroSection'
import { TrustPillars } from '@/components/sections/TrustPillars'
import { IntroStrip } from '@/components/sections/IntroStrip'
import { TreatmentsGrid } from '@/components/sections/TreatmentsGrid'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { StructuredData } from '@/components/seo/StructuredData'
import { CLINIC_ADDRESS_FULL, formatFullAddress } from '@/lib/site/address'

export const metadata: Metadata = {
  description: `Luxury skin rejuvenation on Sydney's Northern Beaches. Visit us at ${CLINIC_ADDRESS_FULL} — book your free consultation today.`,
  alternates: { canonical: '/' },
}

const FEATURED_LIMIT = 8

export default async function HomePage() {
  const [settings, allServices, testimonials] = await Promise.all([
    getSiteSettings(),
    getHomepageFeaturedServices(),
    getTestimonialsByPage('home'),
  ])

  const featuredServices = allServices.slice(0, FEATURED_LIMIT)
  const fullAddress = formatFullAddress(settings)

  return (
    <>
      <StructuredData type="LocalBusiness" settings={settings} />

      <HeroSection
        eyebrow={fullAddress}
        heading={
          <>
            Enhance your{' '}
            <span className="font-normal italic text-brand-600">natural beauty</span>
          </>
        }
        subheading="Personalised face and body treatments in a calm, boutique clinic — where expertise meets care."
        ctaLabel="Book Free Consultation"
        ctaHref="/contact"
        secondaryCtaLabel="See all treatments"
        secondaryCtaHref="/services"
        heroImageUrl="/images/hero-home.png"
        heroImageAlt={`Healthy, glowing skin — luxury skin rejuvenation at Naturally Beautiful, ${fullAddress}`}
        locationLine={fullAddress}
      />

      <Reveal>
        <TrustPillars fullAddress={fullAddress} />
      </Reveal>

      <Reveal delay={0.05}>
        <IntroStrip
          body="Our mission is to help you look and feel your best with advanced skin rejuvenation — delivered with warmth, precision, and respect for what makes you uniquely beautiful."
        />
      </Reveal>

      <Reveal delay={0.05}>
        <TreatmentsGrid
          services={featuredServices}
          heading="Our treatments"
          subheading="Curated face and body services — each tailored to your skin goals."
          showViewAll
        />
      </Reveal>

      {testimonials.length > 0 && (
        <Reveal delay={0.05}>
          <TestimonialsSection testimonials={testimonials} />
        </Reveal>
      )}

      <Reveal delay={0.05}>
        <CTABanner
          heading="Book your free consultation"
          body={`Call us to arrange a complimentary 30-minute skin assessment at ${fullAddress}. We'll recommend the most effective treatment for you.`}
          ctaLabel="Contact us"
          ctaHref="/contact"
          phone={settings.phone ?? undefined}
          phonePrimary
        />
      </Reveal>
    </>
  )
}
