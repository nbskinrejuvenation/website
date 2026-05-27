import { createAdminClient } from '@/lib/supabase/admin'
import { getBookableTreatmentById } from '@/lib/booking/get-bookable-treatment'
import {
  finalizeTreatmentBooking,
  loadTreatmentBookingWithClient,
} from '@/lib/booking/finalize-treatment-booking'
import { createPackageCreditsAfterPurchase } from '@/lib/packages/credits'
import { incrementPromoRedemption } from '@/lib/promo/validate'
import type { Client, TreatmentBooking } from '@/types/database'

export interface ConfirmTreatmentPaymentInput {
  bookingId: string
  stripeCheckoutSessionId: string
  stripePaymentIntentId?: string | null
  packageId?: string | null
  packageSessionCount?: number | null
  promoCodeId?: string | null
}

export interface ConfirmTreatmentPaymentResult {
  confirmed: boolean
  booking: TreatmentBooking | null
  client: Client | null
  treatmentTitle: string | null
}

export async function confirmTreatmentPayment(
  input: ConfirmTreatmentPaymentInput,
): Promise<ConfirmTreatmentPaymentResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: existing, error: fetchError } = await supabase
    .from('treatment_bookings')
    .select(`*, client:clients (*)`)
    .eq('id', input.bookingId)
    .maybeSingle()

  if (fetchError) throw new Error(`confirmTreatmentPayment: ${fetchError.message}`)
  if (!existing) {
    return { confirmed: false, booking: null, client: null, treatmentTitle: null }
  }

  if (existing.status === 'confirmed') {
    const client = Array.isArray(existing.client) ? existing.client[0] : existing.client
    const treatment = await getBookableTreatmentById(existing.treatment_id)
    return {
      confirmed: true,
      booking: existing as TreatmentBooking,
      client: client as Client,
      treatmentTitle: treatment?.title ?? null,
    }
  }

  if (existing.status !== 'pending_payment') {
    return { confirmed: false, booking: existing as TreatmentBooking, client: null, treatmentTitle: null }
  }

  const treatment = await getBookableTreatmentById(existing.treatment_id)
  if (!treatment) {
    throw new Error('Treatment not found for booking confirmation.')
  }

  const { data: booking, error } = await supabase
    .from('treatment_bookings')
    .update({
      status: 'confirmed',
      stripe_checkout_session_id: input.stripeCheckoutSessionId,
      stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.bookingId)
    .eq('status', 'pending_payment')
    .select(`*, client:clients (*)`)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      const raced = await loadTreatmentBookingWithClient(input.bookingId)
      return {
        confirmed: raced?.booking.status === 'confirmed',
        booking: raced?.booking ?? null,
        client: raced?.client ?? null,
        treatmentTitle: raced?.treatmentTitle ?? treatment.title,
      }
    }
    throw new Error(`confirmTreatmentPayment update: ${error.message}`)
  }

  const clientRaw = booking.client
  const client = (Array.isArray(clientRaw) ? clientRaw[0] : clientRaw) as Client
  let packageSessionsRemaining: number | null = null

  const packageId = input.packageId ?? booking.treatment_package_id
  const sessionCount =
    input.packageSessionCount ??
    (packageId ? await resolvePackageSessionCount(packageId) : null)

  if (packageId && sessionCount && sessionCount >= 2) {
    const credit = await createPackageCreditsAfterPurchase({
      clientId: client.id,
      treatmentId: treatment.id,
      packageId,
      sessionCount,
      purchaseAmountCents: booking.amount_cents,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId,
      stripePaymentIntentId: input.stripePaymentIntentId,
      sessionsUsedOnPurchase: 1,
    })
    packageSessionsRemaining = credit.sessions_total - credit.sessions_used
    await supabase
      .from('treatment_bookings')
      .update({
        client_package_credit_id: credit.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)
  }

  const promoCodeId = input.promoCodeId ?? booking.promo_code_id
  if (promoCodeId) {
    await incrementPromoRedemption(promoCodeId)
  }

  const finalized = await finalizeTreatmentBooking({
    booking: booking as TreatmentBooking,
    client,
    treatmentTitle: treatment.title,
    packageSessionsRemaining,
  })

  return {
    confirmed: true,
    booking: finalized,
    client,
    treatmentTitle: treatment.title,
  }
}

export async function cancelPendingTreatmentBooking(bookingId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  await supabase
    .from('treatment_bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .eq('status', 'pending_payment')
}

async function resolvePackageSessionCount(packageId: string): Promise<number | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data } = await supabase
    .from('treatment_packages')
    .select('session_count')
    .eq('id', packageId)
    .maybeSingle()
  return data?.session_count ?? null
}
