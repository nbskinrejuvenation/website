import { REMINDER_HOURS_BEFORE, REMINDER_WINDOW_HOURS } from '@/lib/cron/consultation-reminders'
import { sendTreatmentReminderEmail } from '@/lib/email/treatment-reminder'
import { isClientEmailConfigured } from '@/lib/email/resend'
import { buildTreatmentReminderSms } from '@/lib/sms/treatment-reminder'
import { normalizeAuPhone, isSmsConfigured } from '@/lib/sms/config'
import { sendSms } from '@/lib/sms/twilio'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Client, TreatmentBooking } from '@/types/database'

type BookingRow = TreatmentBooking & {
  client: Client
  treatment: { title: string }
}

export interface TreatmentReminderRunResult {
  candidates: number
  emailSent: number
  smsSent: number
  failed: number
  skipped: number
}

export async function processTreatmentReminders(
  clinicPhone?: string | null,
): Promise<TreatmentReminderRunResult> {
  const now = new Date()
  const windowStart = new Date(
    now.getTime() + (REMINDER_HOURS_BEFORE - REMINDER_WINDOW_HOURS / 2) * 60 * 60 * 1000,
  )
  const windowEnd = new Date(
    now.getTime() + (REMINDER_HOURS_BEFORE + REMINDER_WINDOW_HOURS / 2) * 60 * 60 * 1000,
  )

  const emailConfigured = isClientEmailConfigured()
  const smsConfigured = isSmsConfigured()

  const result: TreatmentReminderRunResult = {
    candidates: 0,
    emailSent: 0,
    smsSent: 0,
    failed: 0,
    skipped: 0,
  }

  if (!emailConfigured && !smsConfigured) return result

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('treatment_bookings')
    .select(`*, client:clients (*), treatment:treatments (title)`)
    .eq('status', 'confirmed')
    .or('reminder_sent_at.is.null,sms_reminder_sent_at.is.null')
    .gte('starts_at', windowStart.toISOString())
    .lt('starts_at', windowEnd.toISOString())

  if (error) throw new Error(`treatment-reminders query: ${error.message}`)

  const bookings = (data ?? []) as BookingRow[]
  result.candidates = bookings.length

  for (const booking of bookings) {
    const treatment = Array.isArray(booking.treatment)
      ? booking.treatment[0]
      : booking.treatment
    const title = treatment?.title ?? 'Treatment'
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
        await sendTreatmentReminderEmail({
          clientName: booking.client.full_name,
          clientEmail: booking.client.email,
          treatmentTitle: title,
          startsAt: new Date(booking.starts_at),
          managementToken: booking.management_token,
        })
        emailOk = true
        result.emailSent++
      }

      let smsOk = false
      if (canSms) {
        const smsResult = await sendSms(
          phone!,
          buildTreatmentReminderSms({
            clientName: booking.client.full_name,
            treatmentTitle: title,
            startsAt: new Date(booking.starts_at),
            managementToken: booking.management_token,
            clinicPhone,
          }),
        )
        if (smsResult.sent) {
          smsOk = true
          result.smsSent++
        }
      }

      if (!emailOk && !smsOk) {
        result.failed++
        continue
      }

      const patch: Record<string, string> = { updated_at: new Date().toISOString() }
      if (emailOk) patch.reminder_sent_at = new Date().toISOString()
      if (smsOk) patch.sms_reminder_sent_at = new Date().toISOString()

      await supabase.from('treatment_bookings').update(patch).eq('id', booking.id)
    } catch (err) {
      console.error(`[treatment-reminders] ${booking.id}:`, err)
      result.failed++
    }
  }

  return result
}
