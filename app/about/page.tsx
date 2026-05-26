import type { Metadata } from 'next'
import { getTestimonialsByPage } from '@/lib/data/testimonials'
import { getSiteSettings } from '@/lib/data/site-settings'
import { TreatmentHero } from '@/components/treatment/TreatmentHero'
import { AboutStory } from '@/components/about/AboutStory'
import { AboutCertificates } from '@/components/about/AboutCertificates'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'

const description =
  "Meet Lilian, founder of Naturally Beautiful Skin Rejuvenation. Accredited beauty therapist on Sydney's Northern Beaches."

export const metadata: Metadata = {
  title: pageTitle('About Us'),
  description,
  openGraph: openGraphDefaults('About Us', description),
  alternates: { canonical: '/about' },
}

export default async function AboutPage() {
  const [testimonials, settings] = await Promise.all([
    getTestimonialsByPage('about'),
    getSiteSettings(),
  ])

  return (
    <>
      <TreatmentHero
        title="About"
        subtitle="Our story"
      />

      <AboutStory />

      <AboutCertificates />

      {testimonials.length > 0 && (
        <TestimonialsSection
          testimonials={testimonials}
          eyebrow="See what"
          heading="Our clients say"
        />
      )}

      <CTABanner
        heading="Book your free consultation"
        body="We'd love to meet you. Book a FREE 30-minute consultation and let us help you be the best version of yourself."
        ctaLabel="Contact Us"
        ctaHref="/book"
        phone={settings.phone ?? undefined}
      />
    </>
  )
}
