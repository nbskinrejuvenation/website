import { sendConsultationCancellationEmail } from '@/lib/email/consultation-cancellation'
import { resolveNestedClient } from '@/lib/email/resolve-client'
import { getSiteSettings } from '@/lib/data/site-settings'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteConsultationCalendarEvent } from '@/lib/google/calendar'
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
}

export async function updateTreatmentBooking(
  id: string,
  patch: {
    status?: TreatmentBookingStatus
    internal_notes?: string | null
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
      google_event_id,
      client:clients (full_name, email)
    `,
    )
    .eq('id', id)
    .single()

  if (fetchError) throw new Error(`updateTreatmentBooking: ${fetchError.message}`)

  const isNewCancellation =
    patch.status === 'cancelled' && existing.status !== 'cancelled'

  let calendarEventRemoved = false

  if (isNewCancellation && existing.google_event_id) {
    try {
      await deleteConsultationCalendarEvent(existing.google_event_id)
      calendarEventRemoved = true
    } catch (err) {
      console.error('[updateTreatmentBooking] Google Calendar delete:', err)
    }
  }

  const dbPatch: Record<string, unknown> = {
    ...patch,
    updated_at: new Date().toISOString(),
  }

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
    if (!clientForEmail?.email) {
      cancellationEmail = {
        sent: false,
        error: 'Could not load client email for this booking.',
        recipient: null,
      }
    } else {
      const settings = await getSiteSettings()
      const emailResult = await sendConsultationCancellationEmail({
        clientName: clientForEmail.full_name,
        clientEmail: clientForEmail.email,
        startsAt: new Date(booking.starts_at),
        clinicPhone: settings.phone,
      })
      cancellationEmail = {
        sent: emailResult.sent,
        error: emailResult.error,
        recipient: clientForEmail.email,
      }
    }
  }

  return { booking, calendarEventRemoved, cancellationEmail }
}
