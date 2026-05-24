import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteSettings } from '@/lib/data/site-settings'
import { ConsultationBooking } from '@/components/booking/ConsultationBooking'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'
import { CLINIC_ADDRESS_FULL } from '@/lib/site/address'

const description = `Book your free 30-minute skin consultation at Naturally Beautiful. Choose a time online — ${CLINIC_ADDRESS_FULL}.`

export const metadata: Metadata = {
  title: pageTitle('Book free consultation'),
  description,
  openGraph: openGraphDefaults('Book free consultation', description, undefined, '/book'),
  alternates: { canonical: '/book' },
  robots: { index: true, follow: true },
}

export default async function BookPage() {
  const settings = await getSiteSettings()

  return (
    <>
      <section className="border-b border-sand-dark/50 bg-cream-dark py-14 md:py-16">
        <div className="section-container text-center">
          <p className="eyebrow mb-3">By appointment</p>
          <h1 className="section-heading">Book your free consultation</h1>
          <p className="mx-auto mt-4 max-w-lg text-ink-muted">
            Pick a time that suits you. We&apos;ll meet at our Dee Why clinic for a complimentary
            30-minute skin assessment.
          </p>
        </div>
      </section>

      <section className="section-container py-12 md:py-16">
        <ConsultationBooking phone={settings.phone ?? undefined} />
      </section>

      <section className="border-t border-sand-dark/50 bg-cream-dark py-10">
        <div className="section-container text-center text-sm text-ink-muted">
          <p>
            Questions?{' '}
            <Link href="/contact" className="font-medium text-brand-600 hover:underline">
              Send us a message
            </Link>{' '}
            or call {settings.phone ?? 'the clinic'}.
          </p>
        </div>
      </section>
    </>
  )
}
