import { CONSULTATION_DURATION_MINUTES } from '@/lib/booking/constants'
import {
  getBookingCalendarForDuration,
  isSlotAvailable,
  resolveSlotTimes,
  type BusyExclusion,
} from '@/lib/booking/availability'
import { getSiteSettings } from '@/lib/data/site-settings'
import { sendAppointmentRescheduleEmail } from '@/lib/email/appointment-reschedule'
import {
  createConsultationCalendarEvent,
  createTreatmentCalendarEvent,
  updateCalendarEventTimes,
} from '@/lib/google/calendar'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Client } from '@/types/database'

export type RescheduleKind = 'consultation' | 'treatment'

export interface RescheduleAppointmentInput {
  kind: RescheduleKind
  id: string
  date: string
  time: string
}

export interface RescheduleAppointmentResult {
  startsAt: string
  endsAt: string
  emailSent: boolean
  calendarSynced: boolean
}

export interface RescheduleOptions {
  /** When true, skips minimum notice rules (admin). Default false for clients. */
  adminOverride?: boolean
}

export async function getRescheduleCalendar(
  kind: RescheduleKind,
  id: string,
  options: RescheduleOptions = {},
): Promise<{ durationMinutes: number; calendar: Array<{ date: string; slots: string[] }> }> {
  const { durationMinutes, exclude } = await getBookingContext(kind, id)
  const calendar = await getBookingCalendarForDuration(durationMinutes, {
    adminOverride: options.adminOverride ?? false,
    exclude,
  })
  return { durationMinutes, calendar }
}

async function getBookingContext(
  kind: RescheduleKind,
  id: string,
): Promise<{ durationMinutes: number; exclude: BusyExclusion }> {
  if (kind === 'consultation') {
    return {
      durationMinutes: CONSULTATION_DURATION_MINUTES,
      exclude: { kind: 'consultation', id },
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatment_bookings')
    .select('id, treatment:treatments (duration_minutes)')
    .eq('id', id)
    .single()

  if (error) throw new Error(`getBookingContext: ${error.message}`)
  const treatment = Array.isArray(data.treatment) ? data.treatment[0] : data.treatment
  const duration = treatment?.duration_minutes ?? 60
  return { durationMinutes: duration, exclude: { kind: 'treatment', id } }
}

export async function rescheduleAppointment(
  input: RescheduleAppointmentInput,
  options: RescheduleOptions = {},
): Promise<RescheduleAppointmentResult> {
  const { durationMinutes, exclude } = await getBookingContext(input.kind, input.id)
  const adminOverride = options.adminOverride ?? false

  const available = await isSlotAvailable(input.date, input.time, durationMinutes, {
    adminOverride,
    exclude,
  })
  if (!available) {
    throw new Error('This time slot is not available. Please choose another.')
  }

  const { startsAt, endsAt } = resolveSlotTimes(input.date, input.time, durationMinutes)

  if (input.kind === 'consultation') {
    return rescheduleConsultation(input.id, startsAt, endsAt)
  }
  return rescheduleTreatment(input.id, startsAt, endsAt)
}

async function rescheduleConsultation(
  id: string,
  startsAt: Date,
  endsAt: Date,
): Promise<RescheduleAppointmentResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: existing, error: fetchError } = await supabase
    .from('consultation_bookings')
    .select(`*, client:clients (*)`)
    .eq('id', id)
    .single()

  if (fetchError) throw new Error(`rescheduleConsultation: ${fetchError.message}`)
  if (existing.status !== 'confirmed') {
    throw new Error('Only confirmed appointments can be rescheduled.')
  }

  const previousStartsAt = new Date(existing.starts_at)
  const client = (Array.isArray(existing.client) ? existing.client[0] : existing.client) as Client

  const { data: updated, error } = await supabase
    .from('consultation_bookings')
    .update({
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(
      error.code === '23505'
        ? 'This time slot was just booked. Please choose another.'
        : error.message,
    )
  }

  let calendarSynced = false
  try {
    if (existing.google_event_id) {
      await updateCalendarEventTimes({
        eventId: existing.google_event_id,
        startsAt,
        endsAt,
      })
      calendarSynced = true
    } else {
      const eventId = await createConsultationCalendarEvent({
        clientName: client.full_name,
        clientEmail: client.email,
        clientPhone: client.phone,
        treatmentInterest: existing.treatment_interest,
        message: existing.message,
        startsAt,
        endsAt,
      })
      if (eventId) {
        await supabase
          .from('consultation_bookings')
          .update({
            google_event_id: eventId,
            google_calendar_synced: true,
          })
          .eq('id', id)
        calendarSynced = true
      }
    }
  } catch (err) {
    console.error('[rescheduleConsultation] calendar:', err)
  }

  const settings = await getSiteSettings()
  const emailResult = await sendAppointmentRescheduleEmail({
    clientName: client.full_name,
    clientEmail: client.email,
    appointmentLabel: 'Free consultation',
    previousStartsAt,
    newStartsAt: startsAt,
    clinicPhone: settings.phone,
    managementToken: existing.management_token as string | undefined,
  })

  return {
    startsAt: updated.starts_at,
    endsAt: updated.ends_at,
    emailSent: emailResult.sent,
    calendarSynced,
  }
}

async function rescheduleTreatment(
  id: string,
  startsAt: Date,
  endsAt: Date,
): Promise<RescheduleAppointmentResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: existing, error: fetchError } = await supabase
    .from('treatment_bookings')
    .select(`*, client:clients (*), treatment:treatments (title)`)
    .eq('id', id)
    .single()

  if (fetchError) throw new Error(`rescheduleTreatment: ${fetchError.message}`)
  if (existing.status !== 'confirmed') {
    throw new Error('Only confirmed paid appointments can be rescheduled.')
  }

  const previousStartsAt = new Date(existing.starts_at)
  const client = (Array.isArray(existing.client) ? existing.client[0] : existing.client) as Client
  const treatment = Array.isArray(existing.treatment) ? existing.treatment[0] : existing.treatment
  const treatmentTitle = treatment?.title ?? 'Treatment'

  const { data: updated, error } = await supabase
    .from('treatment_bookings')
    .update({
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(
      error.code === '23505'
        ? 'This time slot was just booked. Please choose another.'
        : error.message,
    )
  }

  let calendarSynced = false
  try {
    if (existing.google_event_id) {
      await updateCalendarEventTimes({
        eventId: existing.google_event_id,
        startsAt,
        endsAt,
      })
      calendarSynced = true
    } else {
      const eventId = await createTreatmentCalendarEvent({
        treatmentTitle,
        clientName: client.full_name,
        clientEmail: client.email,
        clientPhone: client.phone,
        message: existing.message,
        startsAt,
        endsAt,
        amountCents: existing.amount_cents,
      })
      if (eventId) {
        await supabase
          .from('treatment_bookings')
          .update({
            google_event_id: eventId,
            google_calendar_synced: true,
          })
          .eq('id', id)
        calendarSynced = true
      }
    }
  } catch (err) {
    console.error('[rescheduleTreatment] calendar:', err)
  }

  const settings = await getSiteSettings()
  const emailResult = await sendAppointmentRescheduleEmail({
    clientName: client.full_name,
    clientEmail: client.email,
    appointmentLabel: treatmentTitle,
    previousStartsAt,
    newStartsAt: startsAt,
    clinicPhone: settings.phone,
    managementToken: existing.management_token as string | undefined,
  })

  return {
    startsAt: updated.starts_at,
    endsAt: updated.ends_at,
    emailSent: emailResult.sent,
    calendarSynced,
  }
}
