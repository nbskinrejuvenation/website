import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getAllServices } from '@/lib/data/services'
import { getSiteSettings } from '@/lib/data/site-settings'
import { InstagramSection, instagramSectionFromSettings } from '@/components/sections/InstagramSection'
import { ServiceCard } from '@/components/treatment/ServiceCard'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'
import { CLINIC_ADDRESS_FULL } from '@/lib/site/address'
import type { TreatmentCard } from '@/types/database'

const description = `Explore all face and body treatments at Naturally Beautiful Skin Rejuvenation — micro needling, HIFU, laser, and more. ${CLINIC_ADDRESS_FULL}.`

const VERCEL_FROM_PRICES: Record<string, number> = {
  'carbon-peel': 170,
  'ems-for-muscle-gain': 140,
  'ems-pelvic-floor': 140,
  'fibroblast-plasma': 70,
  'fibroblast': 70,
  'fractional-rf': 200,
  'rf-needling': 200,
  'hifu': 200,
  'hydrodermabrasion': 160,
  'hydra-facial': 160,
  'kumashape': 120,
  'medi-peels-5-berry-and-tca': 170,
  'medi-peels-vit-a': 120,
  'medi-peels-tretinoin': 170,
  'microdermabrasion': 100,
  'microneedling': 60,
  'micro-needling': 60,
  'radio-frequency': 90,
  'tattoo-removal': 50,
  'tattoo-removal-with-saline-solution': 200,
  'zena-algae-peel': 350,
  'laser-rejuvenation': 170,
  'pico-laser-pigmentation': 150,
  'pico-laser': 150,
  'laser-for-nail-fungus': 70,
  'laser-hair-removal-upper-body': 10,
  'laser-hair-removal-lower-body': 15,
  'laser-hair-removal-for-face': 15,
  'add-on-areas': 12,
  'laser-for-vascular-lesions': 70,
  'laser-for-pigmentation': 120,
  'fractional-laser': 180,
  'laser-genesis': 180,
  'laser-genesis-plus-fractional-laser': 280,
  'laser-genesis-fractional-laser': 280,
  'add-on-to-all-facial-treatments': 40,
}

export const metadata: Metadata = {
  title: pageTitle('Our Treatments'),
  description,
  openGraph: openGraphDefaults('Our Treatments', description),
  alternates: { canonical: '/services' },
}

function normalise(value: string): string {
  return value.toLowerCase().trim().replace(/&/g, 'and').replace(/\+/g, 'plus').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function isVercelPreviewHost(host: string): boolean {
  return host.includes('website-iota-vert-23.vercel.app')
}

function applyVercelPriceOverrides(service: TreatmentCard): TreatmentCard {
  const slugKey = normalise(service.slug)
  const titleKey = normalise(service.title)
  const price = VERCEL_FROM_PRICES[slugKey] ?? VERCEL_FROM_PRICES[titleKey]
  return price == null ? service : { ...service, price_from: price }
}

export default async function ServicesPage() {
  const [servicesRaw, settings] = await Promise.all([getAllServices(), getSiteSettings()])
  const host = (await headers()).get('host') ?? ''
  const services = isVercelPreviewHost(host) ? servicesRaw.map(applyVercelPriceOverrides) : servicesRaw

  const face = services.filter(s => s.category === 'face')
  const body = services.filter(s => s.category === 'body')

  return (
    <>
    <div className="section-container py-16">
      <h1 className="section-heading mb-12 text-center">Our Treatments</h1>

      {face.length > 0 && (
        <section id="face" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-xl font-semibold uppercase tracking-widest text-brand-500">
            Face
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {face.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}

      {body.length > 0 && (
        <section id="body" className="scroll-mt-24">
          <h2 className="mb-8 text-xl font-semibold uppercase tracking-widest text-brand-500">
            Body
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {body.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>
      )}

      {face.length === 0 && body.length === 0 && (
        <p className="text-center text-neutral-500">
          Our treatment list is being updated. Please check back soon or call us to book a
          consultation.
        </p>
      )}
    </div>

    <InstagramSection {...instagramSectionFromSettings(settings)} />
    </>
  )
}
