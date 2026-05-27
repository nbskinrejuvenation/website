import { CONSULTATION_DURATION_MINUTES } from '@/lib/booking/constants'
import { getManageBookingUrl } from '@/lib/booking/management-url'
import { emailLayout, formatConsultationWhen } from '@/lib/email/layout'
import {
  emailButton,
  escapeHtml,
  getSiteUrl,
  isClientEmailConfigured,
  sendEmail,
} from '@/lib/email/resend'

export interface ConsultationReminderInput {
  clientName: string
  clientEmail: string
  startsAt: Date
  clinicPhone?: string | null
  managementToken?: string | null
}

function reminderHtml(input: ConsultationReminderInput, when: string): string {
  const contactUrl = `${getSiteUrl()}/contact`
  const manageBlock = input.managementToken
    ? emailButton(getManageBookingUrl(input.managementToken), 'Reschedule or cancel')
    : ''
  const phoneBlock = input.managementToken
    ? ''
    : input.clinicPhone
      ? `<p style="margin:16px 0 0;">Need to reschedule? Call us on <strong>${escapeHtml(input.clinicPhone)}</strong> or <a href="${contactUrl}" style="color:#9a6b73;">send a message</a>.</p>`
      : `<p style="margin:16px 0 0;">Need to reschedule? <a href="${contactUrl}" style="color:#9a6b73;">Contact us</a>.</p>`

  return emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;text-align:center;color:#2c2420;">Reminder: your consultation is coming up</h1>
    <p style="margin:0 0 8px;">Hi ${escapeHtml(input.clientName)},</p>
    <p style="margin:0 0 20px;">This is a friendly reminder about your complimentary ${CONSULTATION_DURATION_MINUTES}-minute skin consultation.</p>
    <p style="margin:0;padding:16px 20px;background:#f0e6e8;border-radius:2px;text-align:center;font-size:16px;color:#2c2420;"><strong>${escapeHtml(when)}</strong></p>
    <p style="margin:20px 0 0;">We look forward to seeing you at our Dee Why clinic.</p>
    ${manageBlock}
    ${phoneBlock}
  `)
}

export async function sendConsultationReminderEmail(
  input: ConsultationReminderInput,
): Promise<void> {
  if (!isClientEmailConfigured()) {
    throw new Error('Email is not configured')
  }

  const when = formatConsultationWhen(input.startsAt)
  await sendEmail({
    to: input.clientEmail,
    subject: `Reminder: your consultation — ${when}`,
    html: reminderHtml(input, when),
  })
}
