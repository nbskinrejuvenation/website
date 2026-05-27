import { createAdminClient } from '@/lib/supabase/admin'
import { getBookableTreatmentById } from '@/lib/booking/get-bookable-treatment'
import { formatConsultationWhen } from '@/lib/email/layout'
import { sendTreatmentBookingEmails } from '@/lib/email/treatment-booking'
import { formatAudFromCents } from '@/lib/stripe/config'
import { notifyClinicNewBooking } from '@/lib/notifications/clinic-booking-alert'
import { createTreatmentCalendarEvent } from '@/lib/google/calendar'
import type { Client, TreatmentBooking } from '@/types/database'

export interface ConfirmTreatmentPaymentInput {
  bookingId: string
  stripeCheckoutSessionId: string
  stripePaymentIntentId?: string | null
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
      const { data: raced } = await supabase
        .from('treatment_bookings')
        .select(`*, client:clients (*)`)
        .eq('id', input.bookingId)
        .single()
      const client = raced?.client
        ? (Array.isArray(raced.client) ? raced.client[0] : raced.client)
        : null
      return {
        confirmed: raced?.status === 'confirmed',
        booking: raced as TreatmentBooking,
        client: client as Client,
        treatmentTitle: treatment.title,
      }
    }
    throw new Error(`confirmTreatmentPayment update: ${error.message}`)
  }

  const clientRaw = booking.client
  const client = (Array.isArray(clientRaw) ? clientRaw[0] : clientRaw) as Client
  const startsAt = new Date(booking.starts_at)
  const endsAt = new Date(booking.ends_at)

  let googleEventId: string | null = null
  let calendarSynced = false

  try {
    googleEventId = await createTreatmentCalendarEvent({
      treatmentTitle: treatment.title,
      clientName: client.full_name,
      clientEmail: client.email,
      clientPhone: client.phone,
      message: booking.message,
      startsAt,
      endsAt,
      amountCents: booking.amount_cents,
    })
    calendarSynced = Boolean(googleEventId)
    if (googleEventId) {
      await supabase
        .from('treatment_bookings')
        .update({
          google_event_id: googleEventId,
          google_calendar_synced: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id)
    }
  } catch (err) {
    console.error('[confirmTreatmentPayment] Google Calendar:', err)
  }

  void notifyClinicNewBooking({
    kind: 'treatment',
    clientName: client.full_name,
    when: formatConsultationWhen(startsAt),
    label: treatment.title,
    amountLabel: formatAudFromCents(booking.amount_cents),
  }).catch(err => console.error('[confirmTreatmentPayment] clinic alert:', err))

  await sendTreatmentBookingEmails({
    clientName: client.full_name,
    clientEmail: client.email,
    clientPhone: client.phone,
    treatmentTitle: treatment.title,
    message: booking.message,
    startsAt,
    amountCents: booking.amount_cents,
    calendarSynced,
    bookingId: booking.id,
    managementToken: (booking as TreatmentBooking).management_token,
  })

  return {
    confirmed: true,
    booking: {
      ...(booking as TreatmentBooking),
      google_event_id: googleEventId,
      google_calendar_synced: calendarSynced,
    },
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
