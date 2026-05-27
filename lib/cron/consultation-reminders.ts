import { sendConsultationReminderEmail } from '@/lib/email/consultation-reminder'
import { isClientEmailConfigured } from '@/lib/email/resend'
import { buildConsultationReminderSms } from '@/lib/sms/consultation-reminder'
import { normalizeAuPhone, isSmsConfigured } from '@/lib/sms/config'
import { sendSms } from '@/lib/sms/twilio'
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
  smsConfigured: boolean
  windowStart: string
  windowEnd: string
  candidates: number
  sent: number
  smsSent: number
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

  const emailConfigured = isClientEmailConfigured()
  const smsConfigured = isSmsConfigured()

  const baseResult: ReminderRunResult = {
    configured: emailConfigured,
    smsConfigured,
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    candidates: 0,
    sent: 0,
    smsSent: 0,
    failed: 0,
    skipped: 0,
  }

  if (!emailConfigured && !smsConfigured) {
    console.warn('[consultation-reminders] Email and SMS not configured — skipping')
    return baseResult
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('consultation_bookings')
    .select('*, client:clients (*)')
    .eq('status', 'confirmed')
    .or('reminder_sent_at.is.null,sms_reminder_sent_at.is.null')
    .gte('starts_at', windowStart.toISOString())
    .lt('starts_at', windowEnd.toISOString())

  if (error) {
    throw new Error(`consultation-reminders query: ${error.message}`)
  }

  const bookings = (data ?? []) as BookingWithClient[]
  const result = { ...baseResult, candidates: bookings.length }

  for (const booking of bookings) {
    const hasEmail = Boolean(booking.client?.email)
    const phone = normalizeAuPhone(booking.client?.phone)
    const canSms = smsConfigured && phone && !booking.sms_reminder_sent_at

    if (!hasEmail && !canSms) {
      result.skipped++
      continue
    }

    try {
      let emailOk = false
      if (hasEmail && emailConfigured && !booking.reminder_sent_at) {
        await sendConsultationReminderEmail({
          clientName: booking.client.full_name,
          clientEmail: booking.client.email,
          startsAt: new Date(booking.starts_at),
          clinicPhone,
          managementToken: booking.management_token,
        })
        emailOk = true
        result.sent++
      }

      let smsOk = false
      if (canSms) {
        const body = buildConsultationReminderSms({
          clientName: booking.client.full_name,
          startsAt: new Date(booking.starts_at),
          managementToken: booking.management_token,
          clinicPhone,
        })
        const smsResult = await sendSms(phone!, body)
        if (smsResult.sent) {
          smsOk = true
          result.smsSent++
        } else {
          console.error(`[consultation-reminders] SMS ${booking.id}:`, smsResult.error)
        }
      }

      if (!emailOk && !smsOk) {
        result.failed++
        continue
      }

      const patch: Record<string, string> = { updated_at: new Date().toISOString() }
      if (emailOk) patch.reminder_sent_at = new Date().toISOString()
      if (smsOk) patch.sms_reminder_sent_at = new Date().toISOString()

      const { error: updateError } = await supabase
        .from('consultation_bookings')
        .update(patch)
        .eq('id', booking.id)

      if (updateError) {
        console.error(`[consultation-reminders] mark sent ${booking.id}:`, updateError)
        result.failed++
      }
    } catch (err) {
      console.error(`[consultation-reminders] send ${booking.id}:`, err)
      result.failed++
    }
  }

  return result
}
