import { sendReviewRequestForBooking } from '@/lib/booking/review-request'
import { sendConsultationCancellationEmail } from '@/lib/email/consultation-cancellation'
import { resolveNestedClient } from '@/lib/email/resolve-client'
import { getSiteSettings } from '@/lib/data/site-settings'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteConsultationCalendarEvent } from '@/lib/google/calendar'
import type { Client, ConsultationBooking, ConsultationStatus } from '@/types/database'

export type ConsultationWithClient = ConsultationBooking & {
  client: Client
}

export async function listConsultations(filters?: {
  status?: ConsultationStatus | 'upcoming' | 'all'
}): Promise<ConsultationWithClient[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  let query = supabase
    .from('consultation_bookings')
    .select(
      `
      *,
      client:clients (*)
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
  if (error) throw new Error(`listConsultations: ${error.message}`)

  return (data ?? []) as ConsultationWithClient[]
}

export interface CancellationEmailResult {
  sent: boolean
  error: string | null
  recipient: string | null
}

export interface UpdateConsultationResult {
  consultation: ConsultationWithClient
  calendarEventRemoved: boolean
  cancellationEmail: CancellationEmailResult | null
}

async function fetchClientForBooking(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  clientId: string,
): Promise<{ full_name: string; email: string } | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('full_name, email')
    .eq('id', clientId)
    .single()

  if (error || !data?.email) return null
  return data as { full_name: string; email: string }
}

export async function sendCancellationEmailForBooking(
  bookingId: string,
): Promise<CancellationEmailResult & { consultation: ConsultationWithClient }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('consultation_bookings')
    .select(`*, client:clients (*)`)
    .eq('id', bookingId)
    .single()

  if (error) throw new Error(`sendCancellationEmailForBooking: ${error.message}`)

  const consultation = data as ConsultationWithClient
  if (consultation.status !== 'cancelled') {
    throw new Error('Cancellation email can only be sent for cancelled bookings.')
  }

  let client =
    resolveNestedClient(consultation.client) ??
    (await fetchClientForBooking(supabase, consultation.client_id))

  if (!client) {
    return {
      consultation,
      sent: false,
      error: 'Could not load client email for this booking.',
      recipient: null,
    }
  }

  const settings = await getSiteSettings()
  const emailResult = await sendConsultationCancellationEmail({
    clientName: client.full_name,
    clientEmail: client.email,
    startsAt: new Date(consultation.starts_at),
    clinicPhone: settings.phone,
  })

  return {
    consultation,
    sent: emailResult.sent,
    error: emailResult.error,
    recipient: client.email,
  }
}

export async function updateConsultation(
  id: string,
  patch: {
    status?: ConsultationStatus
    internal_notes?: string | null
    no_show_notes?: string | null
  },
): Promise<UpdateConsultationResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: existing, error: fetchError } = await supabase
    .from('consultation_bookings')
    .select(
      `
      id,
      status,
      starts_at,
      google_event_id,
      google_calendar_synced,
      client:clients (full_name, email)
    `,
    )
    .eq('id', id)
    .single()

  if (fetchError) throw new Error(`updateConsultation: ${fetchError.message}`)

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
      console.error('[updateConsultation] Google Calendar delete:', err)
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
    .from('consultation_bookings')
    .update(dbPatch)
    .eq('id', id)
    .select(`*, client:clients (*)`)
    .single()

  if (error) throw new Error(`updateConsultation: ${error.message}`)

  const consultation = data as ConsultationWithClient

  let cancellationEmail: CancellationEmailResult | null = null

  if (isNewCancellation) {
    const clientForEmail =
      resolveNestedClient(consultation.client) ??
      resolveNestedClient(existing.client) ??
      (await fetchClientForBooking(supabase, consultation.client_id))

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
        startsAt: new Date(consultation.starts_at),
        clinicPhone: settings.phone,
      })
      cancellationEmail = {
        sent: emailResult.sent,
        error: emailResult.error,
        recipient: clientForEmail.email,
      }
    }
  }

  if (isNewCompletion) {
    void sendReviewRequestForBooking('consultation', id).catch(err => {
      console.error('[updateConsultation] review request:', err)
    })
  }

  return {
    consultation,
    calendarEventRemoved,
    cancellationEmail,
  }
}

export async function updateClientNotes(
  clientId: string,
  notes: string | null,
): Promise<Client> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('clients')
    .update({ notes: notes?.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .select('*')
    .single()

  if (error) throw new Error(`updateClientNotes: ${error.message}`)
  return data as Client
}
