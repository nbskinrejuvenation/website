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
import { InstagramSection, instagramSectionFromSettings } from '@/components/sections/InstagramSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { StructuredData } from '@/components/seo/StructuredData'
import { CLINIC_ADDRESS_FULL, formatFullAddress } from '@/lib/site/address'
import { HERO_POSTER_URL, HERO_VIDEO_URL } from '@/lib/site/hero'

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
        eyebrow="Boutique skin & laser clinic"
        heading={
          <>
            Healthy Skin.
            <br />
            <span className="!text-brand-600">Natural Confidence.</span>
          </>
        }
        subheading="Personalised skin and laser treatments designed to help you look refreshed, feel confident, and achieve naturally radiant results."
        ctaLabel="Book Free Consultation"
        ctaHref="/book"
        secondaryCtaLabel="See all treatments"
        secondaryCtaHref="/services"
        heroVideoUrl={HERO_VIDEO_URL}
        heroImageUrl={HERO_POSTER_URL}
        heroImageAlt={`Healthy, glowing skin — luxury skin rejuvenation at Naturally Beautiful, ${fullAddress}`}
      />

      <Reveal>
        <TrustPillars fullAddress={fullAddress} />
      </Reveal>

      <Reveal delay={0.05}>
        <IntroStrip />
      </Reveal>

      <Reveal delay={0.05}>
        <TreatmentsGrid
          services={featuredServices}
          heading="Our treatments"
          subheading="Curated face and body services — each tailored to your skin goals."
          showViewAll
        />
      </Reveal>

      <Reveal delay={0.05}>
        <InstagramSection {...instagramSectionFromSettings(settings)} />
      </Reveal>

      <Reveal delay={0.05}>
        <TestimonialsSection
          testimonials={testimonials}
          eyebrow="See what"
          heading="Our clients say"
        />
      </Reveal>

      <Reveal delay={0.05}>
        <CTABanner
          heading="Book your free consultation"
          body={`Call us to arrange a complimentary 30-minute skin assessment at ${fullAddress}. We'll recommend the most effective treatment for you.`}
          ctaLabel="Contact us"
          ctaHref="/book"
          phone={settings.phone ?? undefined}
          phonePrimary
        />
      </Reveal>
    </>
  )
}
