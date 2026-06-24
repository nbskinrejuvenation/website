import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getAllServiceSlugs, getServiceBySlug } from '@/lib/data/services'
import { getSiteSettings } from '@/lib/data/site-settings'
import { TreatmentHero } from '@/components/treatment/TreatmentHero'
import { TreatmentBody } from '@/components/treatment/TreatmentBody'
import { TreatmentPricing } from '@/components/treatment/TreatmentPricing'
import { TreatmentFAQ } from '@/components/treatment/TreatmentFAQ'
import { TreatmentIntro } from '@/components/treatment/TreatmentIntro'
import { TreatmentRecommendedFor } from '@/components/treatment/TreatmentRecommendedFor'
import { TreatmentWhatToExpect } from '@/components/treatment/TreatmentWhatToExpect'
import {
  parsePricing,
  parseRecommendedFor,
  stripPricingSection,
  stripRecommendedForSection,
  stripLeadParagraph,
  stripFaqSection,
  type PricingGroup,
  type PricingItem,
} from '@/lib/treatment/parse-pricing'
import { InstagramSection, instagramSectionFromSettings } from '@/components/sections/InstagramSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { StructuredData } from '@/components/seo/StructuredData'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/seo/breadcrumbs'
import { getIndexableFaqs } from '@/lib/seo/faq'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'
import { formatAudFromCents, isStripeConfigured } from '@/lib/stripe/config'

interface Props {
  params: Promise<{ slug: string }>
}

const PRICE_B64_URL = 'https://raw.githubusercontent.com/robbenaustralia/BEAUTY-WEBPAGE/main/services/prices.b64'

const PRICE_ALIASES: Record<string, string> = {
  'fibroblast-plasma': 'fibroblast',
  'fractional-rf': 'fractional-rf-mude-o-nome-para-rf-needling',
  'rf-needling': 'fractional-rf-mude-o-nome-para-rf-needling',
  'hydra-facial': 'hydrodermabrasion',
  'micro-needling': 'microneedling',
  'pico-laser': 'pico-laser-pigmentation',
}

function normalisePriceKey(value: string): string {
  return value.toLowerCase().trim().replace(/&/g, 'and').replace(/\+/g, 'plus').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function canonicalKey(value: string): string {
  const key = normalisePriceKey(value)
  return PRICE_ALIASES[key] ?? key
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quote = false

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]
    const n = text[i + 1]
    if (c === '"' && quote && n === '"') {
      cell += '"'
      i += 1
      continue
    }
    if (c === '"') {
      quote = !quote
      continue
    }
    if (c === ',' && !quote) {
      row.push(cell)
      cell = ''
      continue
    }
    if ((c === '\n' || c === '\r') && !quote) {
      if (c === '\r' && n === '\n') i += 1
      row.push(cell)
      if (row.some(v => v.trim())) rows.push(row)
      row = []
      cell = ''
      continue
    }
    cell += c
  }

  if (cell || row.length) {
    row.push(cell)
    if (row.some(v => v.trim())) rows.push(row)
  }
  return rows
}

function money(value: string | undefined): string {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return ''
  if (trimmed.toLowerCase().startsWith('from')) return trimmed.replace(/^from\s*/i, 'From ')
  return trimmed.startsWith('$') ? trimmed : `$${trimmed}`
}

function isVercelHost(host: string): boolean {
  return host.includes('website-iota-vert-23.vercel.app')
}

async function getSpreadsheetPricing(slug: string, title?: string | null): Promise<PricingGroup[] | null> {
  try {
    const response = await fetch(PRICE_B64_URL, { cache: 'no-store' })
    if (!response.ok) return null
    const csv = Buffer.from((await response.text()).trim(), 'base64').toString('utf8')
    const rows = parseCSV(csv)
    const header = rows[0] ?? []
    const index = Object.fromEntries(header.map((name, i) => [name.trim(), i]))
    const targetKeys = new Set([canonicalKey(slug), title ? canonicalKey(title) : ''])
    const singles: PricingItem[] = []
    const packs: Record<string, PricingItem[]> = {}

    for (const row of rows.slice(1)) {
      const treatment = row[index.Treatment]?.trim()
      const area = row[index.Area]?.trim()
      const singlePrice = row[index['Single Price']]?.trim()
      const packQty = row[index['Pack Quantity']]?.trim()
      const packagePrice = row[index['Package Price']]?.trim()
      const perTreatment = row[index['Per Treatment in Package']]?.trim()
      const savings = row[index.Savings]?.trim()

      if (!treatment || !area || !targetKeys.has(canonicalKey(treatment))) continue
      if (singlePrice) singles.push({ label: area, price: money(singlePrice), subtitle: 'One session' })
      if (packQty && packagePrice) {
        const packName = `Pack of ${packQty}`
        packs[packName] ??= []
        const subtitle = [
          perTreatment ? `${money(perTreatment)} per session` : '',
          savings ? `Save ${money(savings)}` : '',
        ].filter(Boolean).join(', ')
        packs[packName].push({
          label: area,
          price: money(packagePrice),
          subtitle: subtitle || undefined,
        })
      }
    }

    if (!singles.length) return null
    const groups: PricingGroup[] = [{ name: 'Single sessions', items: singles }]
    Object.entries(packs).forEach(([packName, items]) => groups.push({ name: packName, items }))
    return groups
  } catch {
    return null
  }
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

  const host = (await headers()).get('host') ?? ''
  const spreadsheetPricing = isVercelHost(host) ? await getSpreadsheetPricing(slug, service.title) : null
  const pricingGroups = spreadsheetPricing ?? (service.body_html ? parsePricing(service.body_html) : null)
  const recommendedFor = service.body_html ? parseRecommendedFor(service.body_html) : null

  const strippedHtml = service.body_html
    ? stripFaqSection(stripLeadParagraph(stripRecommendedForSection(stripPricingSection(service.body_html))))
    : null
  const bodyHtml = strippedHtml && strippedHtml.length > 20 ? strippedHtml : null

  const allFaqs = service.schema_faq ?? []
  const hasFaqs = allFaqs.length > 0
  const indexableFaqs = getIndexableFaqs(allFaqs)

  const canBookOnline = isStripeConfigured() && service.bookable_online && service.price_cents != null && service.price_cents > 0
  const bookOnlineUrl = canBookOnline ? `/book/treatment/${slug}` : undefined
  const bookOnlineLabel = service.price_cents != null ? `Book & pay from ${formatAudFromCents(service.price_cents)}` : 'Book & pay online'

  return (
    <>
      <StructuredData type="Service" treatment={service} settings={settings} />
      <JsonLd data={buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Treatments', path: '/services' }, { name: service.title, path: `/services/${slug}` }])} />
      {indexableFaqs.length > 0 && <StructuredData type="FAQPage" faqs={indexableFaqs} />}
      <TreatmentHero title={service.title} subtitle={service.subtitle ?? undefined} heroImageUrl={service.hero_image ?? undefined} bookOnlineUrl={bookOnlineUrl} bookOnlineLabel={bookOnlineLabel} />
      <TreatmentIntro title={service.title} subtitle={service.subtitle ?? service.title} summary={service.summary ?? service.subtitle ?? service.title} heroImageUrl={service.hero_image ?? undefined} />
      {bodyHtml && <TreatmentBody bodyHtml={bodyHtml} />}
      {recommendedFor && <TreatmentRecommendedFor conditions={recommendedFor} />}
      {service.what_to_expect && service.what_to_expect.length > 0 && <TreatmentWhatToExpect items={service.what_to_expect as string[]} />}
      {pricingGroups && <TreatmentPricing groups={pricingGroups} />}
      {hasFaqs && <TreatmentFAQ faqs={service.schema_faq!} serviceName={service.title} />}
      <InstagramSection {...instagramSectionFromSettings(settings)} />
      <CTABanner heading={canBookOnline ? 'Book your appointment' : 'Book your free consultation'} body={canBookOnline ? `Secure your ${service.title} appointment online, or book a free consultation if you'd like advice first.` : "Ready to get started? Book a FREE 30-minute consultation and we'll recommend the most effective treatment for your skin."} ctaLabel={canBookOnline ? bookOnlineLabel : 'Book Now'} ctaHref={canBookOnline ? bookOnlineUrl! : '/book'} phone={settings.phone ?? undefined} />
    </>
  )
}
