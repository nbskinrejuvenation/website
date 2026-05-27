import { getBookableTreatmentBySlug } from '@/lib/booking/get-bookable-treatment'
import { isSlotAvailable, resolveSlotTimes } from '@/lib/booking/availability'
import { upsertClient } from '@/lib/booking/upsert-client'
import {
  finalizeTreatmentBooking,
  loadTreatmentBookingWithClient,
} from '@/lib/booking/finalize-treatment-booking'
import { resolveTreatmentBookingPricing } from '@/lib/booking/treatment-booking-pricing'
import { redeemPackageCredit } from '@/lib/packages/credits'
import { incrementPromoRedemption } from '@/lib/promo/validate'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteUrl } from '@/lib/email/resend'
import { getStripe } from '@/lib/stripe/client'
import {
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
  promo_code?: string
  package_id?: string
  client_package_credit_id?: string
}

export interface CreateTreatmentCheckoutResult {
  checkoutUrl: string
  bookingId: string
}

export async function createTreatmentCheckout(
  input: CreateTreatmentCheckoutInput,
): Promise<CreateTreatmentCheckoutResult> {
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

  const usingCredit = Boolean(input.client_package_credit_id)
  if (usingCredit && (input.package_id || input.promo_code)) {
    throw new Error('Package credits cannot be combined with promo codes or new packages.')
  }

  const pricing = await resolveTreatmentBookingPricing({
    treatment,
    packageId: input.package_id,
    promoCode: input.promo_code,
    usePackageCredit: usingCredit,
  })

  if (usingCredit && !input.client_package_credit_id) {
    throw new Error('Select a package credit to redeem.')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data: booking, error } = await supabase
    .from('treatment_bookings')
    .insert({
      client_id: client.id,
      treatment_id: treatment.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: pricing.requiresPayment ? 'pending_payment' : 'confirmed',
      amount_cents: pricing.chargeCents,
      original_amount_cents: pricing.baseCents,
      discount_cents: pricing.discountCents,
      promo_code_id: pricing.promoCodeId,
      treatment_package_id: pricing.treatmentPackageId,
      client_package_credit_id: usingCredit ? input.client_package_credit_id : null,
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

  if (!pricing.requiresPayment) {
    try {
      if (usingCredit && input.client_package_credit_id) {
        const redeemed = await redeemPackageCredit(input.client_package_credit_id, client.id)
        if (!redeemed) {
          throw new Error('Could not redeem package session. It may already be used.')
        }
        await supabase
          .from('treatment_bookings')
          .update({
            client_package_credit_id: redeemed.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.id)

        const remaining = redeemed.sessions_total - redeemed.sessions_used
        const loaded = await loadTreatmentBookingWithClient(booking.id)
        if (loaded) {
          await finalizeTreatmentBooking({
            ...loaded,
            packageSessionsRemaining: remaining,
          })
        }
        if (pricing.promoCodeId) {
          await incrementPromoRedemption(pricing.promoCodeId)
        }
      } else if (pricing.chargeCents === 0 && pricing.promoCodeId) {
        const loaded = await loadTreatmentBookingWithClient(booking.id)
        if (loaded) {
          await finalizeTreatmentBooking(loaded)
        }
        await incrementPromoRedemption(pricing.promoCodeId)
      }

      const siteUrl = getSiteUrl()
      return {
        checkoutUrl: `${siteUrl}/book/treatment/${treatment.slug}/success?booking_id=${booking.id}`,
        bookingId: booking.id,
      }
    } catch (err) {
      await supabase
        .from('treatment_bookings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', booking.id)
      throw err
    }
  }

  if (!isStripeConfigured()) {
    await supabase
      .from('treatment_bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', booking.id)
    throw new Error('Online payments are not available yet. Please call us to book.')
  }

  const siteUrl = getSiteUrl()
  const stripe = getStripe()
  const depositPercent = getStripeDepositPercent()
  const whenLabel = startsAt.toLocaleString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Australia/Sydney',
  })

  const isPackagePurchase = Boolean(pricing.treatmentPackageId)
  const paymentLabel =
    depositPercent < 100 && !isPackagePurchase
      ? `${formatAudFromCents(pricing.chargeCents)} deposit`
      : formatAudFromCents(pricing.chargeCents)

  const productName = isPackagePurchase
    ? `${treatment.title} — ${pricing.packageSessionCount}-session package`
    : `${treatment.title} — ${paymentLabel}`

  let description = `Appointment: ${whenLabel} (${duration} min)`
  if (pricing.discountCents > 0 && pricing.promoLabel) {
    description += ` · Promo ${pricing.promoLabel} applied`
  }

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
            unit_amount: pricing.chargeCents,
            product_data: {
              name: productName,
              description,
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
        ...(pricing.treatmentPackageId
          ? { package_id: pricing.treatmentPackageId, package_session_count: String(pricing.packageSessionCount) }
          : {}),
        ...(pricing.promoCodeId ? { promo_code_id: pricing.promoCodeId } : {}),
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
