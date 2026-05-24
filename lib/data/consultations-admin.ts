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

export interface UpdateConsultationResult {
  consultation: ConsultationWithClient
  calendarEventRemoved: boolean
}

export async function updateConsultation(
  id: string,
  patch: {
    status?: ConsultationStatus
    internal_notes?: string | null
  },
): Promise<UpdateConsultationResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: existing, error: fetchError } = await supabase
    .from('consultation_bookings')
    .select('id, status, google_event_id, google_calendar_synced')
    .eq('id', id)
    .single()

  if (fetchError) throw new Error(`updateConsultation: ${fetchError.message}`)

  const isNewCancellation =
    patch.status === 'cancelled' &&
    existing.status !== 'cancelled' &&
    Boolean(existing.google_event_id)

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
  return {
    consultation: data as ConsultationWithClient,
    calendarEventRemoved,
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
