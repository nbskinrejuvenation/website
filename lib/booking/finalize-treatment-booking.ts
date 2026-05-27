import { getBookableTreatmentById } from '@/lib/booking/get-bookable-treatment'
import { formatConsultationWhen } from '@/lib/email/layout'
import { sendTreatmentBookingEmails } from '@/lib/email/treatment-booking'
import { notifyClinicNewBooking } from '@/lib/notifications/clinic-booking-alert'
import { createTreatmentCalendarEvent } from '@/lib/google/calendar'
import { formatAudFromCents } from '@/lib/stripe/config'
import type { Client, TreatmentBooking } from '@/types/database'
import { createAdminClient } from '@/lib/supabase/admin'

export interface FinalizeTreatmentBookingInput {
  booking: TreatmentBooking
  client: Client
  treatmentTitle: string
  packageSessionsRemaining?: number | null
}

/** Calendar, emails, and clinic alerts after a treatment booking is confirmed. */
export async function finalizeTreatmentBooking(
  input: FinalizeTreatmentBookingInput,
): Promise<TreatmentBooking> {
  const { booking, client, treatmentTitle } = input
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const startsAt = new Date(booking.starts_at)
  const endsAt = new Date(booking.ends_at)

  let googleEventId: string | null = booking.google_event_id
  let calendarSynced = booking.google_calendar_synced

  if (!calendarSynced) {
    try {
      googleEventId = await createTreatmentCalendarEvent({
        treatmentTitle,
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
      console.error('[finalizeTreatmentBooking] Google Calendar:', err)
    }
  }

  const amountLabel =
    booking.amount_cents > 0
      ? formatAudFromCents(booking.amount_cents)
      : input.packageSessionsRemaining != null
        ? `Package session (${input.packageSessionsRemaining} left)`
        : 'Prepaid / no charge'

  void notifyClinicNewBooking({
    kind: 'treatment',
    clientName: client.full_name,
    when: formatConsultationWhen(startsAt),
    label: treatmentTitle,
    amountLabel,
  }).catch(err => console.error('[finalizeTreatmentBooking] clinic alert:', err))

  await sendTreatmentBookingEmails({
    clientName: client.full_name,
    clientEmail: client.email,
    clientPhone: client.phone,
    treatmentTitle,
    message: booking.message,
    startsAt,
    amountCents: booking.amount_cents,
    calendarSynced,
    bookingId: booking.id,
    managementToken: booking.management_token,
    packageSessionsRemaining: input.packageSessionsRemaining,
  })

  return {
    ...booking,
    google_event_id: googleEventId,
    google_calendar_synced: calendarSynced,
  }
}

export async function loadTreatmentBookingWithClient(
  bookingId: string,
): Promise<{ booking: TreatmentBooking; client: Client; treatmentTitle: string } | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatment_bookings')
    .select(`*, client:clients (*)`)
    .eq('id', bookingId)
    .maybeSingle()

  if (error || !data) return null
  const clientRaw = data.client
  const client = (Array.isArray(clientRaw) ? clientRaw[0] : clientRaw) as Client
  const treatment = await getBookableTreatmentById(data.treatment_id)
  if (!treatment) return null

  return {
    booking: data as TreatmentBooking,
    client,
    treatmentTitle: treatment.title,
  }
}
