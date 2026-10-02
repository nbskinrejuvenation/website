import type { Metadata } from 'next'
import { getTestimonialsByPage } from '@/lib/data/testimonials'
import { getSiteSettings } from '@/lib/data/site-settings'
import { AboutHero } from '@/components/about/AboutHero'
import { AboutValues } from '@/components/about/AboutValues'
import { AboutStory } from '@/components/about/AboutStory'
import { AboutCertificates } from '@/components/about/AboutCertificates'
import { AboutTestimonials } from '@/components/about/AboutTestimonials'
import { AboutConsultation } from '@/components/about/AboutConsultation'
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
      <AboutHero imageUrl="/images/lilian-about.webp" />
      <AboutValues />
      <AboutStory />
      <AboutCertificates />
      {testimonials.length > 0 && <AboutTestimonials testimonials={testimonials} />}
      <AboutConsultation phone={settings.phone ?? undefined} />
    </>
  )
}
