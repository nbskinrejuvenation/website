import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllServiceSlugs, getServiceBySlug } from '@/lib/data/services'
import { getSiteSettings } from '@/lib/data/site-settings'
import { TreatmentHero } from '@/components/treatment/TreatmentHero'
import { TreatmentBody } from '@/components/treatment/TreatmentBody'
import { TreatmentFAQ } from '@/components/treatment/TreatmentFAQ'
import { CTABanner } from '@/components/sections/CTABanner'
import { StructuredData } from '@/components/seo/StructuredData'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return {}

  const title = service.seo_title ?? service.title
  const description = service.seo_description ?? service.subtitle ?? undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(service.og_image_url ? { images: [{ url: service.og_image_url }] } : {}),
    },
    alternates: { canonical: `/services/${slug}` },
  }
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const [service, settings] = await Promise.all([
    getServiceBySlug(slug),
    getSiteSettings(),
  ])

  if (!service) notFound()

  const hasFaqs = (service.schema_faq?.length ?? 0) > 0

  return (
    <>
      <StructuredData type="Service" treatment={service} settings={settings} />
      {hasFaqs && <StructuredData type="FAQPage" faqs={service.schema_faq!} />}

      <TreatmentHero
        title={service.title}
        subtitle={service.subtitle ?? undefined}
        heroImageUrl={service.hero_image ?? undefined}
      />

      {service.body_html && (
        <TreatmentBody bodyHtml={service.body_html} />
      )}

      {hasFaqs && (
        <TreatmentFAQ faqs={service.schema_faq!} serviceName={service.title} />
      )}

      <CTABanner
        heading="Book your free consultation"
        body="Ready to get started? Book a FREE 30-minute consultation and we'll recommend the most effective treatment for your skin."
        ctaLabel="Book Now"
        ctaHref="/contact"
        phone={settings.phone ?? undefined}
      />
    </>
  )
}
