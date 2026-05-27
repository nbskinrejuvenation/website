import { emailLayout, formatConsultationWhen } from '@/lib/email/layout'
import type { EmailSendResult } from '@/lib/email/send-result'
import { emailSent, emailSkipped } from '@/lib/email/send-result'
import { getManageBookingUrl } from '@/lib/booking/management-url'
import { emailButton, escapeHtml, getSiteUrl, isClientEmailConfigured, sendEmail } from '@/lib/email/resend'

export interface AppointmentRescheduleEmailInput {
  clientName: string
  clientEmail: string
  appointmentLabel: string
  previousStartsAt: Date
  newStartsAt: Date
  clinicPhone?: string | null
  managementToken?: string | null
}

function rescheduleHtml(input: AppointmentRescheduleEmailInput, was: string, now: string): string {
  const contactUrl = `${getSiteUrl()}/contact`
  const phoneLine = input.clinicPhone
    ? `<p style="margin:16px 0 0;text-align:center;font-size:14px;color:#6b5f58;">Questions? Call <strong>${escapeHtml(input.clinicPhone)}</strong></p>`
    : ''

  return emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;text-align:center;color:#2c2420;">Your appointment has been rescheduled</h1>
    <p style="margin:0 0 8px;">Hi ${escapeHtml(input.clientName)},</p>
    <p style="margin:0 0 20px;">Your <strong>${escapeHtml(input.appointmentLabel)}</strong> appointment has been moved to a new time.</p>
    <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#6b5f58;">Was</p>
    <p style="margin:0 0 16px;padding:12px 16px;background:#f5f0f1;border-radius:2px;text-align:center;color:#6b5f58;text-decoration:line-through;">${escapeHtml(was)}</p>
    <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#6b5f58;">Now</p>
    <p style="margin:0;padding:16px 20px;background:#f0e6e8;border-radius:2px;text-align:center;font-size:16px;color:#2c2420;"><strong>${escapeHtml(now)}</strong></p>
    <p style="margin:24px 0 0;text-align:center;color:#6b5f58;">A calendar update has been sent if you use Google Calendar invitations.</p>
    ${
      input.managementToken
        ? emailButton(getManageBookingUrl(input.managementToken), 'Manage appointment')
        : ''
    }
    ${phoneLine}
    <p style="margin:20px 0 0;text-align:center;font-size:14px;">
      <a href="${contactUrl}" style="color:#9a6b73;text-decoration:underline;">Contact us</a> if this time does not suit
    </p>
  `)
}

export async function sendAppointmentRescheduleEmail(
  input: AppointmentRescheduleEmailInput,
): Promise<EmailSendResult> {
  if (!isClientEmailConfigured()) {
    return emailSkipped('Email not configured')
  }

  const to = input.clientEmail.trim()
  if (!to.includes('@')) {
    return emailSkipped('Invalid client email')
  }

  const was = formatConsultationWhen(input.previousStartsAt)
  const now = formatConsultationWhen(input.newStartsAt)

  try {
    await sendEmail({
      to,
      subject: `Appointment rescheduled — ${now}`,
      html: rescheduleHtml(input, was, now),
    })
    return emailSent()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Send failed'
    console.error('[email] reschedule:', msg)
    return emailSkipped(msg)
  }
}
