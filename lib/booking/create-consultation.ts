import { createAdminClient } from '@/lib/supabase/admin'
import { getAvailableSlotsForDate, resolveSlotTimes } from '@/lib/booking/slots'
import { createConsultationCalendarEvent } from '@/lib/google/calendar'
import type { Client, ConsultationBooking } from '@/types/database'

export interface BookConsultationInput {
  full_name: string
  email: string
  phone?: string
  treatment_interest?: string
  message?: string
  source_page?: string
  date: string
  time: string
}

export interface BookConsultationResult {
  booking: ConsultationBooking
  client: Client
  calendarSynced: boolean
}

async function upsertClient(input: BookConsultationInput): Promise<Client> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const email = input.email.trim().toLowerCase()

  const { data: existing } = await supabase
    .from('clients')
    .select('*')
    .ilike('email', email)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('clients')
      .update({
        full_name: input.full_name.trim(),
        phone: input.phone?.trim() || existing.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    if (error) throw new Error(`client update: ${error.message}`)
    return data as Client
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      full_name: input.full_name.trim(),
      email,
      phone: input.phone?.trim() || null,
    })
    .select('*')
    .single()

  if (error) throw new Error(`client insert: ${error.message}`)
  return data as Client
}

export async function bookConsultation(
  input: BookConsultationInput,
): Promise<BookConsultationResult> {
  const available = await getAvailableSlotsForDate(input.date)
  if (!available.includes(input.time)) {
    throw new Error('This time slot is no longer available. Please choose another.')
  }

  const { startsAt, endsAt } = resolveSlotTimes(input.date, input.time)
  const client = await upsertClient(input)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data: booking, error } = await supabase
    .from('consultation_bookings')
    .insert({
      client_id: client.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'confirmed',
      treatment_interest: input.treatment_interest?.trim() || null,
      message: input.message?.trim() || null,
      source_page: input.source_page || null,
      google_event_id: null,
      google_calendar_synced: false,
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

  let googleEventId: string | null = null
  let calendarSynced = false

  try {
    googleEventId = await createConsultationCalendarEvent({
      clientName: client.full_name,
      clientEmail: client.email,
      clientPhone: client.phone,
      treatmentInterest: input.treatment_interest,
      message: input.message,
      startsAt,
      endsAt,
    })
    calendarSynced = Boolean(googleEventId)
    if (googleEventId) {
      await supabase
        .from('consultation_bookings')
        .update({
          google_event_id: googleEventId,
          google_calendar_synced: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id)
    }
  } catch (err) {
    console.error('[bookConsultation] Google Calendar:', err)
  }

  return {
    booking: {
      ...(booking as ConsultationBooking),
      google_event_id: googleEventId,
      google_calendar_synced: calendarSynced,
    },
    client,
    calendarSynced,
  }
}
