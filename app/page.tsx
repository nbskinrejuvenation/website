import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/data/site-settings'
import { getHomepageFeaturedServices } from '@/lib/data/homepage'
import { getTestimonialsByPage } from '@/lib/data/testimonials'
import { HeroSection } from '@/components/sections/HeroSection'
import { TreatmentsGrid } from '@/components/sections/TreatmentsGrid'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { StructuredData } from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: 'Naturally Beautiful Skin Rejuvenation',
  description:
    "Professional skin rejuvenation on Sydney's Northern Beaches. Face & body treatments including micro needling, HIFU, Fractional RF, and more.",
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [settings, featuredServices, testimonials] = await Promise.all([
    getSiteSettings(),
    getHomepageFeaturedServices(),
    getTestimonialsByPage('home'),
  ])

  return (
    <>
      <StructuredData type="LocalBusiness" settings={settings} />

      <HeroSection
        eyebrow="Our mission is to"
        heading="Enhance your natural beauty"
        ctaLabel="Book Free Consultation"
        ctaHref="/contact"
      />

      <TreatmentsGrid services={featuredServices} />

      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      <CTABanner
        heading="Book your free consultation"
        body="Give us a call today and book your FREE consultation (by appointment only) at our Northern Beaches clinic. We'll assess your skin and recommend the most effective treatment for you."
        ctaLabel="Contact Us"
        ctaHref="/contact"
        phone={settings.phone ?? undefined}
      />
    </>
  )
}
