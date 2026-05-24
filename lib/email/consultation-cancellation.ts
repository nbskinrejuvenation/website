import { CONSULTATION_DURATION_MINUTES } from '@/lib/booking/constants'
import { emailLayout, formatConsultationWhen } from '@/lib/email/layout'
import type { EmailSendResult } from '@/lib/email/send-result'
import { emailSent, emailSkipped } from '@/lib/email/send-result'
import {
  emailButton,
  escapeHtml,
  getSiteUrl,
  isClientEmailConfigured,
  sendEmail,
} from '@/lib/email/resend'

export interface ConsultationCancellationInput {
  clientName: string
  clientEmail: string
  startsAt: Date
  clinicPhone?: string | null
}

function cancellationHtml(input: ConsultationCancellationInput, when: string): string {
  const bookUrl = `${getSiteUrl()}/book`
  const contactUrl = `${getSiteUrl()}/contact`
  const phoneLine = input.clinicPhone
    ? `<p style="margin:16px 0 0;text-align:center;font-size:14px;color:#6b5f58;">Or call us on <strong>${escapeHtml(input.clinicPhone)}</strong></p>`
    : ''

  return emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;text-align:center;color:#2c2420;">Your consultation has been cancelled</h1>
    <p style="margin:0 0 8px;">Hi ${escapeHtml(input.clientName)},</p>
    <p style="margin:0 0 20px;">Your complimentary ${CONSULTATION_DURATION_MINUTES}-minute skin consultation has been cancelled:</p>
    <p style="margin:0;padding:16px 20px;background:#f0e6e8;border-radius:2px;text-align:center;font-size:16px;color:#2c2420;"><strong>${escapeHtml(when)}</strong></p>
    <p style="margin:24px 0 0;text-align:center;color:#6b5f58;">We'd love to see you another time. Book a new free consultation below:</p>
    ${emailButton(bookUrl, 'Book a new consultation')}
    ${phoneLine}
    <p style="margin:20px 0 0;text-align:center;font-size:14px;">
      <a href="${contactUrl}" style="color:#9a6b73;text-decoration:underline;">Contact us</a> with any questions
    </p>
  `)
}

/** Sends cancellation notice to the client. */
export async function sendConsultationCancellationEmail(
  input: ConsultationCancellationInput,
): Promise<EmailSendResult> {
  if (!isClientEmailConfigured()) {
    const msg =
      'Email not configured on server. Set RESEND_API_KEY and EMAIL_FROM (quoted if it has spaces) in Vercel or .env.local.'
    console.warn('[email] cancellation:', msg)
    return emailSkipped(msg)
  }

  const to = input.clientEmail.trim()
  if (!to || !to.includes('@')) {
    return emailSkipped('Client has no valid email address on file.')
  }

  const when = formatConsultationWhen(input.startsAt)
  try {
    await sendEmail({
      to,
      subject: `Consultation cancelled — ${when}`,
      html: cancellationHtml(input, when),
    })
    return emailSent()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Resend send failed'
    console.error('[email] cancellation:', msg)
    return emailSkipped(msg)
  }
}
