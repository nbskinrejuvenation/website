import { getBookableTreatmentBySlug } from '@/lib/booking/get-bookable-treatment'
import { isSlotAvailable, resolveSlotTimes } from '@/lib/booking/availability'
import { upsertClient } from '@/lib/booking/upsert-client'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteUrl } from '@/lib/email/resend'
import { getStripe } from '@/lib/stripe/client'
import {
  calculateChargeCents,
  formatAudFromCents,
  getStripeDepositPercent,
  isStripeConfigured,
} from '@/lib/stripe/config'
import { PENDING_PAYMENT_HOLD_MINUTES } from '@/lib/booking/constants'
import type { Client, TreatmentBooking } from '@/types/database'

export interface CreateTreatmentCheckoutInput {
  slug: string
  full_name: string
  email: string
  phone?: string
  message?: string
  date: string
  time: string
  source_page?: string
}

export interface CreateTreatmentCheckoutResult {
  checkoutUrl: string
  bookingId: string
}

export async function createTreatmentCheckout(
  input: CreateTreatmentCheckoutInput,
): Promise<CreateTreatmentCheckoutResult> {
  if (!isStripeConfigured()) {
    throw new Error('Online payments are not available yet. Please call us to book.')
  }

  const treatment = await getBookableTreatmentBySlug(input.slug)
  if (!treatment) {
    throw new Error('This treatment is not available for online booking.')
  }

  const duration = treatment.duration_minutes
  const available = await isSlotAvailable(input.date, input.time, duration)
  if (!available) {
    throw new Error('This time slot is no longer available. Please choose another.')
  }

  const { startsAt, endsAt } = resolveSlotTimes(input.date, input.time, duration)
  const client = await upsertClient(input)
  const amountCents = calculateChargeCents(treatment.price_cents!)
  const depositPercent = getStripeDepositPercent()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data: booking, error } = await supabase
    .from('treatment_bookings')
    .insert({
      client_id: client.id,
      treatment_id: treatment.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'pending_payment',
      amount_cents: amountCents,
      currency: 'aud',
      message: input.message?.trim() || null,
      source_page: input.source_page || null,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(
      error.code === '23505'
        ? 'This time slot was just booked. Please choose another.'
        : `booking insert: ${error.message}`,
    )
  }

  const siteUrl = getSiteUrl()
  const stripe = getStripe()
  const whenLabel = startsAt.toLocaleString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Australia/Sydney',
  })

  const paymentLabel =
    depositPercent < 100
      ? `${formatAudFromCents(amountCents)} deposit`
      : formatAudFromCents(amountCents)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: client.email,
      client_reference_id: booking.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'aud',
            unit_amount: amountCents,
            product_data: {
              name: `${treatment.title} — ${paymentLabel}`,
              description: `Appointment: ${whenLabel} (${duration} min)`,
            },
          },
        },
      ],
      success_url: `${siteUrl}/book/treatment/${treatment.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/book/treatment/${treatment.slug}?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + PENDING_PAYMENT_HOLD_MINUTES * 60,
      metadata: {
        booking_id: booking.id,
        booking_type: 'treatment',
        treatment_slug: treatment.slug,
      },
    })

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL.')
    }

    await supabase
      .from('treatment_bookings')
      .update({
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)

    return { checkoutUrl: session.url, bookingId: booking.id }
  } catch (err) {
    await supabase
      .from('treatment_bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', booking.id)
    throw err
  }
}

export type { Client, TreatmentBooking }
