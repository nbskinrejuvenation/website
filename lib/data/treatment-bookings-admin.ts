import { sendReviewRequestForBooking } from '@/lib/booking/review-request'
import { sendTreatmentCancellationEmail } from '@/lib/email/treatment-cancellation'
import { resolveNestedClient } from '@/lib/email/resolve-client'
import { getSiteSettings } from '@/lib/data/site-settings'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteConsultationCalendarEvent } from '@/lib/google/calendar'
import { refundPaymentIntent } from '@/lib/stripe/refund'
import { isStripeConfigured } from '@/lib/stripe/config'
import type { Client, TreatmentBooking, TreatmentBookingStatus } from '@/types/database'

export type TreatmentBookingWithRelations = TreatmentBooking & {
  client: Client
  treatment: { id: string; slug: string; title: string }
}

export async function listTreatmentBookings(filters?: {
  status?: TreatmentBookingStatus | 'upcoming' | 'all'
}): Promise<TreatmentBookingWithRelations[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  let query = supabase
    .from('treatment_bookings')
    .select(
      `
      *,
      client:clients (*),
      treatment:treatments (id, slug, title)
    `,
    )
    .order('starts_at', { ascending: true })

  const status = filters?.status ?? 'upcoming'
  const now = new Date().toISOString()

  if (status === 'upcoming') {
    query = query.eq('status', 'confirmed').gte('starts_at', now)
  } else if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw new Error(`listTreatmentBookings: ${error.message}`)

  return (data ?? []) as TreatmentBookingWithRelations[]
}

export interface UpdateTreatmentBookingResult {
  booking: TreatmentBookingWithRelations
  calendarEventRemoved: boolean
  cancellationEmail: { sent: boolean; error: string | null; recipient: string | null } | null
  refund: { issued: boolean; error: string | null; amountCents: number | null } | null
}

export async function updateTreatmentBooking(
  id: string,
  patch: {
    status?: TreatmentBookingStatus
    internal_notes?: string | null
    no_show_notes?: string | null
    refund?: boolean
  },
): Promise<UpdateTreatmentBookingResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: existing, error: fetchError } = await supabase
    .from('treatment_bookings')
    .select(
      `
      id,
      status,
      starts_at,
      amount_cents,
      stripe_payment_intent_id,
      google_event_id,
      client:clients (full_name, email),
      treatment:treatments (title)
    `,
    )
    .eq('id', id)
    .single()

  if (fetchError) throw new Error(`updateTreatmentBooking: ${fetchError.message}`)

  const isNewCancellation =
    patch.status === 'cancelled' && existing.status !== 'cancelled'
  const isNewCompletion =
    patch.status === 'completed' && existing.status !== 'completed'

  let calendarEventRemoved = false

  if (isNewCancellation && existing.google_event_id) {
    try {
      await deleteConsultationCalendarEvent(existing.google_event_id)
      calendarEventRemoved = true
    } catch (err) {
      console.error('[updateTreatmentBooking] Google Calendar delete:', err)
    }
  }

  let refundResult: UpdateTreatmentBookingResult['refund'] = null

  if (isNewCancellation && patch.refund && existing.stripe_payment_intent_id) {
    if (!isStripeConfigured()) {
      refundResult = { issued: false, error: 'Stripe not configured', amountCents: null }
    } else {
      try {
        const result = await refundPaymentIntent(existing.stripe_payment_intent_id)
        refundResult = { issued: true, error: null, amountCents: result.amountCents }
      } catch (err) {
        refundResult = {
          issued: false,
          error: err instanceof Error ? err.message : 'Refund failed',
          amountCents: null,
        }
      }
    }
  } else if (isNewCancellation && patch.refund && !existing.stripe_payment_intent_id) {
    refundResult = { issued: false, error: 'No payment on file to refund', amountCents: null }
  }

  const dbPatch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (patch.status !== undefined) dbPatch.status = patch.status
  if (patch.internal_notes !== undefined) dbPatch.internal_notes = patch.internal_notes
  if (patch.no_show_notes !== undefined) dbPatch.no_show_notes = patch.no_show_notes

  if (isNewCancellation) {
    dbPatch.google_event_id = null
    dbPatch.google_calendar_synced = false
  }

  const { data, error } = await supabase
    .from('treatment_bookings')
    .update(dbPatch)
    .eq('id', id)
    .select(
      `
      *,
      client:clients (*),
      treatment:treatments (id, slug, title)
    `,
    )
    .single()

  if (error) throw new Error(`updateTreatmentBooking: ${error.message}`)

  const booking = data as TreatmentBookingWithRelations

  let cancellationEmail: UpdateTreatmentBookingResult['cancellationEmail'] = null

  if (isNewCancellation) {
    const clientForEmail = resolveNestedClient(existing.client)
    const treatmentRaw = existing.treatment
    const treatmentTitle = Array.isArray(treatmentRaw)
      ? treatmentRaw[0]?.title
      : treatmentRaw?.title

    if (!clientForEmail?.email) {
      cancellationEmail = {
        sent: false,
        error: 'Could not load client email for this booking.',
        recipient: null,
      }
    } else {
      const settings = await getSiteSettings()
      const emailResult = await sendTreatmentCancellationEmail({
        clientName: clientForEmail.full_name,
        clientEmail: clientForEmail.email,
        treatmentTitle: treatmentTitle ?? 'Treatment',
        startsAt: new Date(booking.starts_at),
        amountCents: booking.amount_cents,
        clinicPhone: settings.phone,
        refunded: refundResult?.issued ?? false,
      })
      cancellationEmail = {
        sent: emailResult.sent,
        error: emailResult.error,
        recipient: clientForEmail.email,
      }
    }
  }

  if (isNewCompletion) {
    void sendReviewRequestForBooking('treatment', id).catch(err => {
      console.error('[updateTreatmentBooking] review request:', err)
    })
  }

  return { booking, calendarEventRemoved, cancellationEmail, refund: refundResult }
}

export async function refundTreatmentBooking(id: string): Promise<{
  booking: TreatmentBookingWithRelations
  refund: { issued: boolean; error: string | null; amountCents: number | null }
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: existing, error: fetchError } = await supabase
    .from('treatment_bookings')
    .select('id, status, stripe_payment_intent_id, amount_cents')
    .eq('id', id)
    .single()

  if (fetchError) throw new Error(`refundTreatmentBooking: ${fetchError.message}`)
  if (existing.status !== 'confirmed' && existing.status !== 'cancelled') {
    throw new Error('Refunds apply to confirmed or cancelled paid bookings only.')
  }
  if (!existing.stripe_payment_intent_id) {
    throw new Error('No Stripe payment found for this booking.')
  }

  const refund = await refundPaymentIntent(existing.stripe_payment_intent_id)

  const { data, error } = await supabase
    .from('treatment_bookings')
    .select(`*, client:clients (*), treatment:treatments (id, slug, title)`)
    .eq('id', id)
    .single()

  if (error) throw new Error(`refundTreatmentBooking: ${error.message}`)

  return {
    booking: data as TreatmentBookingWithRelations,
    refund: { issued: true, error: null, amountCents: refund.amountCents },
  }
}
