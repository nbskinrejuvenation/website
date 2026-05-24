import { sendConsultationReminderEmail } from '@/lib/email/consultation-reminder'
import { isClientEmailConfigured } from '@/lib/email/resend'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Client, ConsultationBooking } from '@/types/database'

/** Hours before appointment to send the reminder */
export const REMINDER_HOURS_BEFORE = 24

/**
 * Window width — Vercel Hobby allows one cron run per day, so we use a wide
 * window (~18–30h before) so each booking is still caught once per day.
 */
const REMINDER_WINDOW_HOURS = 12

type BookingWithClient = ConsultationBooking & { client: Client }

export interface ReminderRunResult {
  configured: boolean
  windowStart: string
  windowEnd: string
  candidates: number
  sent: number
  failed: number
  skipped: number
}

export async function processConsultationReminders(
  clinicPhone?: string | null,
): Promise<ReminderRunResult> {
  const now = new Date()
  const windowStart = new Date(
    now.getTime() + (REMINDER_HOURS_BEFORE - REMINDER_WINDOW_HOURS / 2) * 60 * 60 * 1000,
  )
  const windowEnd = new Date(
    now.getTime() + (REMINDER_HOURS_BEFORE + REMINDER_WINDOW_HOURS / 2) * 60 * 60 * 1000,
  )

  const baseResult: ReminderRunResult = {
    configured: isClientEmailConfigured(),
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    candidates: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  }

  if (!isClientEmailConfigured()) {
    console.warn('[consultation-reminders] Email not configured — skipping')
    return baseResult
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('consultation_bookings')
    .select('*, client:clients (*)')
    .eq('status', 'confirmed')
    .is('reminder_sent_at', null)
    .gte('starts_at', windowStart.toISOString())
    .lt('starts_at', windowEnd.toISOString())

  if (error) {
    throw new Error(`consultation-reminders query: ${error.message}`)
  }

  const bookings = (data ?? []) as BookingWithClient[]
  const result = { ...baseResult, candidates: bookings.length }

  for (const booking of bookings) {
    if (!booking.client?.email) {
      result.skipped++
      continue
    }

    try {
      await sendConsultationReminderEmail({
        clientName: booking.client.full_name,
        clientEmail: booking.client.email,
        startsAt: new Date(booking.starts_at),
        clinicPhone,
      })

      const { error: updateError } = await supabase
        .from('consultation_bookings')
        .update({
          reminder_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id)
        .is('reminder_sent_at', null)

      if (updateError) {
        console.error(`[consultation-reminders] mark sent ${booking.id}:`, updateError)
        result.failed++
        continue
      }

      result.sent++
    } catch (err) {
      console.error(`[consultation-reminders] send ${booking.id}:`, err)
      result.failed++
    }
  }

  return result
}
