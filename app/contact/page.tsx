import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Car } from 'lucide-react'
import { getSiteSettings } from '@/lib/data/site-settings'
import { ConsultationForm } from '@/components/forms/ConsultationForm'
import { StructuredData } from '@/components/seo/StructuredData'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'
import { ClinicMap } from '@/components/contact/ClinicMap'
import { buildGoogleMapsSearchUrl } from '@/lib/google/maps'
import { CLINIC_ADDRESS_FULL } from '@/lib/site/address'
import { TreatmentHero } from '@/components/treatment/TreatmentHero'

const description = `Book a FREE consultation at Naturally Beautiful Skin Rejuvenation, ${CLINIC_ADDRESS_FULL}. Call or send us a message.`

export const metadata: Metadata = {
  title: pageTitle('Contact Us'),
  description,
  openGraph: openGraphDefaults('Contact Us', description),
  alternates: { canonical: '/contact' },
}

function buildInfoCards(mapsUrl: string) {
  return [
  {
    icon: Phone,
    label: 'Call or SMS',
    lines: ['0404 203 800', 'We communicate via WhatsApp too'],
    href: 'tel:0404203800',
  },
  {
    icon: Mail,
    label: 'Email',
    lines: ['hello@nbskinrejuvenation.com.au', 'Or send us a message using the form below'],
    href: 'mailto:hello@nbskinrejuvenation.com.au',
  },
  {
    icon: MapPin,
    label: 'Location',
    lines: ['Shop 9–10, 8–12 Pacific Parade', 'Dee Why, NSW 2099', 'Northern Beaches'],
    href: mapsUrl,
  },
  {
    icon: Car,
    label: 'Parking',
    lines: ['Enjoy 3-hour FREE parking at the', 'Dee Why Grand, directly across', 'the street from us'],
  },
]
}


export default async function ContactPage() {
  const settings = await getSiteSettings()
  const mapsUrl = buildGoogleMapsSearchUrl(CLINIC_ADDRESS_FULL)
  const infoCards = buildInfoCards(mapsUrl)

  return (
    <>
      <StructuredData type="LocalBusiness" settings={settings} />

      {/* Dark hero — matches original navy style */}
      <TreatmentHero title="Contact Us" subtitle="Get in touch" />

      {/* 4-column info cards */}
      <section className="bg-white py-16">
        <div className="section-container">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {infoCards.map(({ icon: Icon, label, lines, href }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                  {label}
                </p>
                {href ? (
                  <a href={href} className="text-sm leading-relaxed text-ink/70 hover:text-brand-500 transition-colors">
                    {lines.map((l, i) => <span key={i} className="block">{l}</span>)}
                  </a>
                ) : (
                  <div className="text-sm leading-relaxed text-ink/70">
                    {lines.map((l, i) => <span key={i} className="block">{l}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + map */}
      <section className="bg-neutral-50 py-16">
        <div className="section-container">
          <div className="grid gap-16 lg:grid-cols-2">

            {/* Contact form */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                Book your free consultation
              </p>
              <h2 className="mb-8 font-display text-2xl font-light text-ink md:text-3xl">
                Send us a message
              </h2>
              <ConsultationForm />
            </div>

            {/* Map + visit info */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                  Pay us a visit
                </p>
                <h2 className="mb-4 font-display text-2xl font-light text-ink md:text-3xl">
                  Find us on the Northern Beaches
                </h2>
                <p className="text-sm leading-relaxed text-ink/70">
                  We are located in Dee Why, at Sydney's beautiful Northern Beaches.
                  By appointment only.
                </p>
              </div>

              <ClinicMap settings={settings} />
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
