import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/data/site-settings'
import { ConsultationForm } from '@/components/forms/ConsultationForm'
import { StructuredData } from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Book a FREE consultation at Naturally Beautiful Skin Rejuvenation, Dee Why NSW. Call or send us a message.',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <>
      <StructuredData type="LocalBusiness" settings={settings} />

      <section className="bg-neutral-50 py-20 text-center">
        <div className="section-container">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-500">
            Get in touch
          </p>
          <h1 className="section-heading">Book your free consultation</h1>
        </div>
      </section>

      <section className="section-container py-16">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Contact details */}
          <div>
            <h2 className="mb-6 text-xl font-semibold tracking-wide text-neutral-800">
              Contact details
            </h2>

            <dl className="space-y-5 text-neutral-600">
              {settings.phone && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Phone</dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${settings.phone}`}
                      className="text-lg text-neutral-800 hover:text-brand-500 transition-colors"
                    >
                      {settings.phone}
                    </a>
                  </dd>
                </div>
              )}
              {(settings.address || settings.suburb) && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Address</dt>
                  <dd className="mt-1">
                    {settings.address && <>{settings.address}<br /></>}
                    {[settings.suburb, settings.state, settings.postcode]
                      .filter(Boolean)
                      .join(', ')}
                  </dd>
                </div>
              )}
              {settings.booking_url && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Online booking</dt>
                  <dd className="mt-1">
                    <a
                      href={settings.booking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-500 hover:underline"
                    >
                      Book online →
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            {/* Map embed */}
            {settings.lat && settings.lng && (
              <div className="mt-8 aspect-video overflow-hidden bg-neutral-100">
                <iframe
                  title={`Map to ${settings.business_name ?? 'Naturally Beautiful Skin Rejuvenation'}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&q=${settings.lat},${settings.lng}&zoom=15`}
                />
              </div>
            )}
          </div>

          {/* Contact form */}
          <div>
            <h2 className="mb-6 text-xl font-semibold tracking-wide text-neutral-800">
              Send us a message
            </h2>
            <ConsultationForm />
          </div>
        </div>
      </section>
    </>
  )
}
