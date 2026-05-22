import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllServiceSlugs, getServiceBySlug } from '@/lib/data/services'
import { getSiteSettings } from '@/lib/data/site-settings'
import { TreatmentHero } from '@/components/treatment/TreatmentHero'
import { TreatmentBody } from '@/components/treatment/TreatmentBody'
import { TreatmentFAQ } from '@/components/treatment/TreatmentFAQ'
import { InstagramSection, instagramSectionFromSettings } from '@/components/sections/InstagramSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { StructuredData } from '@/components/seo/StructuredData'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/seo/breadcrumbs'
import { getIndexableFaqs } from '@/lib/seo/faq'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [service, settings] = await Promise.all([
    getServiceBySlug(slug),
    getSiteSettings(),
  ])
  if (!service) return {}

  const brand = settings.business_name ?? 'Naturally Beautiful Skin Rejuvenation'
  const description = service.seo_description ?? service.subtitle ?? undefined
  const ogTitle = `${service.title} | ${brand}`

  return {
    title: pageTitle(service.title),
    description,
    openGraph: openGraphDefaults(
      ogTitle,
      description ?? '',
      service.og_image_url ?? service.hero_image,
      `/services/${slug}`,
    ),
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

  const allFaqs = service.schema_faq ?? []
  const hasFaqs = allFaqs.length > 0
  const indexableFaqs = getIndexableFaqs(allFaqs)

  return (
    <>
      <StructuredData type="Service" treatment={service} settings={settings} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Treatments', path: '/services' },
          { name: service.title, path: `/services/${slug}` },
        ])}
      />
      {indexableFaqs.length > 0 && <StructuredData type="FAQPage" faqs={indexableFaqs} />}

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

      <InstagramSection {...instagramSectionFromSettings(settings)} />

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
