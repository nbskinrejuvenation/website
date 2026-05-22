import type { Metadata } from 'next'
import { getPage } from '@/lib/data/pages'
import { getTestimonialsByPage } from '@/lib/data/testimonials'
import { getSiteSettings } from '@/lib/data/site-settings'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'

const fallbackDescription =
  "Meet Lilian, founder of Naturally Beautiful Skin Rejuvenation. Accredited beauty therapist on Sydney's Northern Beaches."

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPage('about')
    const description = page.seo_description ?? fallbackDescription
    return {
      title: pageTitle('About Us'),
      description,
      openGraph: openGraphDefaults('About Us', description),
      alternates: { canonical: '/about' },
    }
  } catch {
    return {
      title: pageTitle('About Us'),
      description: fallbackDescription,
      openGraph: openGraphDefaults('About Us', fallbackDescription),
      alternates: { canonical: '/about' },
    }
  }
}

export default async function AboutPage() {
  const [testimonials, settings] = await Promise.all([
    getTestimonialsByPage('about'),
    getSiteSettings(),
  ])

  let bodyHtml: string | null = null
  try {
    const page = await getPage('about')
    bodyHtml = page.body_html
  } catch {
    // page row not yet seeded — render static fallback below
  }

  return (
    <>
      {/* Page Hero */}
      <section className="relative bg-neutral-50 py-20">
        <div className="section-container text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-500">
            Our story
          </p>
          <h1 className="section-heading">About Us</h1>
        </div>
      </section>

      {/* Page body from CMS or static fallback */}
      {bodyHtml ? (
        <section className="section-container py-16">
          <div
            className="prose prose-neutral mx-auto max-w-3xl prose-headings:font-display prose-headings:font-light prose-a:text-brand-500 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </section>
      ) : (
        <section className="section-container py-16">
          <div className="prose prose-neutral mx-auto max-w-3xl">
            <p>
              Naturally Beautiful Skin Rejuvenation is a boutique beauty clinic in Dee Why on
              Sydney&apos;s Northern Beaches, founded and run by Lilian — an accredited beauty
              therapist with a passion for evidence-based skin treatments.
            </p>
            <p>
              Lilian&apos;s approach combines the latest non-invasive technologies with a genuine
              commitment to your skin health, delivering treatments tailored to your unique skin type
              and goals.
            </p>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      <CTABanner
        heading="Book your free consultation"
        body="We'd love to meet you. Book a FREE 30-minute consultation and let us help you be the best version of yourself."
        ctaLabel="Contact Us"
        ctaHref="/contact"
        phone={settings.phone ?? undefined}
      />
    </>
  )
}
