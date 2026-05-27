import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TreatmentBooking } from '@/components/booking/TreatmentBooking'
import { getTreatmentBookingOptions } from '@/lib/booking/get-treatment-booking-options'
import { getSiteSettings } from '@/lib/data/site-settings'
import { isStripeConfigured } from '@/lib/stripe/config'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ cancelled?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const options = await getTreatmentBookingOptions(slug)
  if (!options) return {}

  const description = `Book and pay for ${options.treatment.title} online at Naturally Beautiful Skin Rejuvenation.`
  return {
    title: pageTitle(`Book ${options.treatment.title}`),
    description,
    openGraph: openGraphDefaults(
      `Book ${options.treatment.title}`,
      description,
      undefined,
      `/book/treatment/${slug}`,
    ),
    alternates: { canonical: `/book/treatment/${slug}` },
    robots: { index: false, follow: true },
  }
}

export default async function BookTreatmentPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { cancelled } = await searchParams

  if (!isStripeConfigured()) {
    return (
      <section className="section-container py-16 text-center">
        <h1 className="section-heading">Online booking unavailable</h1>
        <p className="mt-4 text-ink-muted">
          Paid online booking is not set up yet. Please{' '}
          <Link href="/contact" className="text-brand-600 hover:underline">
            contact us
          </Link>{' '}
          or{' '}
          <Link href="/book" className="text-brand-600 hover:underline">
            book a free consultation
          </Link>
          .
        </p>
      </section>
    )
  }

  const options = await getTreatmentBookingOptions(slug)
  if (!options) notFound()

  const settings = await getSiteSettings()

  return (
    <>
      <section className="border-b border-sand-dark/50 bg-cream-dark py-14 md:py-16">
        <div className="section-container text-center">
          <p className="eyebrow mb-3">Book &amp; pay</p>
          <h1 className="section-heading">{options.treatment.title}</h1>
          <p className="mx-auto mt-4 max-w-lg text-ink-muted">
            Choose single session or a multi-session package, pick a time, and pay securely online (
            {options.treatment.duration_minutes} minutes per visit).
          </p>
        </div>
      </section>

      <section className="section-container py-12 md:py-16">
        <TreatmentBooking
          slug={slug}
          treatmentTitle={options.treatment.title}
          durationMinutes={options.treatment.duration_minutes}
          singleChargeLabel={options.single.chargeLabel}
          packages={options.packages}
          phone={settings.phone ?? undefined}
          cancelled={cancelled === '1'}
        />
      </section>
    </>
  )
}
