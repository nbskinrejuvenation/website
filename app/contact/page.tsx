import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Car } from 'lucide-react'
import { getSiteSettings } from '@/lib/data/site-settings'
import { ConsultationForm } from '@/components/forms/ConsultationForm'
import { StructuredData } from '@/components/seo/StructuredData'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'
import { CLINIC_ADDRESS_FULL } from '@/lib/site/address'
import { TreatmentHero } from '@/components/treatment/TreatmentHero'

const description = `Book a FREE consultation at Naturally Beautiful Skin Rejuvenation, ${CLINIC_ADDRESS_FULL}. Call or send us a message.`

export const metadata: Metadata = {
  title: pageTitle('Contact Us'),
  description,
  openGraph: openGraphDefaults('Contact Us', description),
  alternates: { canonical: '/contact' },
}

const INFO_CARDS = [
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
    lines: ['9 and 10/8-12 Pacific Parade', 'Dee Why, 2099 NSW', 'Northern Beaches'],
    href: 'https://maps.google.com/?q=8-12+Pacific+Parade+Dee+Why+NSW',
  },
  {
    icon: Car,
    label: 'Parking',
    lines: ['Enjoy 3-hour FREE parking at the', 'Dee Why Grand, directly across', 'the street from us'],
  },
]

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <>
      <StructuredData type="LocalBusiness" settings={settings} />

      {/* Dark hero — matches original navy style */}
      <TreatmentHero title="Contact Us" subtitle="Get in touch" />

      {/* 4-column info cards */}
      <section className="bg-white py-16">
        <div className="section-container">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {INFO_CARDS.map(({ icon: Icon, label, lines, href }) => (
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

              {settings.lat && settings.lng ? (
                <div className="aspect-video overflow-hidden rounded-xl bg-brand-100">
                  <iframe
                    title="Map to Naturally Beautiful Skin Rejuvenation"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&q=${settings.lat},${settings.lng}&zoom=15`}
                  />
                </div>
              ) : (
                <div className="aspect-video overflow-hidden rounded-xl bg-brand-100 flex items-center justify-center">
                  <a
                    href="https://maps.google.com/?q=8-12+Pacific+Parade+Dee+Why+NSW"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
