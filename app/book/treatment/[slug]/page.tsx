import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TreatmentBooking } from '@/components/booking/TreatmentBooking'
import { getBookableTreatmentBySlug } from '@/lib/booking/get-bookable-treatment'
import { getSiteSettings } from '@/lib/data/site-settings'
import {
  calculateChargeCents,
  formatAudFromCents,
  getStripeDepositPercent,
  isStripeConfigured,
} from '@/lib/stripe/config'
import { openGraphDefaults, pageTitle } from '@/lib/seo/metadata'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ cancelled?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const treatment = await getBookableTreatmentBySlug(slug)
  if (!treatment) return {}

  const description = `Book and pay for ${treatment.title} online at Naturally Beautiful Skin Rejuvenation.`
  return {
    title: pageTitle(`Book ${treatment.title}`),
    description,
    openGraph: openGraphDefaults(
      `Book ${treatment.title}`,
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

  const treatment = await getBookableTreatmentBySlug(slug)
  if (!treatment) notFound()

  const settings = await getSiteSettings()
  const chargeCents = calculateChargeCents(treatment.price_cents!)
  const depositPercent = getStripeDepositPercent()
  const chargeLabel =
    depositPercent < 100
      ? `${formatAudFromCents(chargeCents)} deposit`
      : formatAudFromCents(chargeCents)

  return (
    <>
      <section className="border-b border-sand-dark/50 bg-cream-dark py-14 md:py-16">
        <div className="section-container text-center">
          <p className="eyebrow mb-3">Book &amp; pay</p>
          <h1 className="section-heading">{treatment.title}</h1>
          <p className="mx-auto mt-4 max-w-lg text-ink-muted">
            Choose a time and pay {chargeLabel} to secure your appointment ({treatment.duration_minutes}{' '}
            minutes).
          </p>
          {depositPercent < 100 && (
            <p className="mx-auto mt-3 max-w-lg text-sm text-ink-muted">
              A {depositPercent}% deposit ({formatAudFromCents(chargeCents)}) is charged now. The
              remaining balance is due at your appointment.
            </p>
          )}
        </div>
      </section>

      <section className="section-container py-12 md:py-16">
        <TreatmentBooking
          slug={slug}
          treatmentTitle={treatment.title}
          durationMinutes={treatment.duration_minutes}
          chargeLabel={chargeLabel}
          phone={settings.phone ?? undefined}
          cancelled={cancelled === '1'}
        />
      </section>
    </>
  )
}
