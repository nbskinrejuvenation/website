import { getManageBookingUrl } from '@/lib/booking/management-url'
import { emailLayout, formatConsultationWhen } from '@/lib/email/layout'
import { emailButton, escapeHtml, isClientEmailConfigured, sendEmail } from '@/lib/email/resend'

export interface TreatmentReminderEmailInput {
  clientName: string
  clientEmail: string
  treatmentTitle: string
  startsAt: Date
  managementToken?: string | null
}

export async function sendTreatmentReminderEmail(
  input: TreatmentReminderEmailInput,
): Promise<void> {
  if (!isClientEmailConfigured()) return

  const when = formatConsultationWhen(input.startsAt)
  const html = emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;text-align:center;color:#2c2420;">Reminder: your appointment is tomorrow</h1>
    <p style="margin:0 0 8px;">Hi ${escapeHtml(input.clientName)},</p>
    <p style="margin:0 0 20px;">This is a friendly reminder about your <strong>${escapeHtml(input.treatmentTitle)}</strong> appointment.</p>
    <p style="margin:0;padding:16px 20px;background:#f0e6e8;border-radius:2px;text-align:center;font-size:16px;color:#2c2420;"><strong>${escapeHtml(when)}</strong></p>
    ${
      input.managementToken
        ? emailButton(getManageBookingUrl(input.managementToken), 'Manage appointment')
        : ''
    }
    <p style="margin:20px 0 0;">We look forward to seeing you at our Dee Why clinic.</p>
  `)

  await sendEmail({
    to: input.clientEmail,
    subject: `Reminder: ${input.treatmentTitle} — ${when}`,
    html,
  })
}
