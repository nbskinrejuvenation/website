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
import { formatAudFromCents } from '@/lib/stripe/config'

export interface TreatmentCancellationInput {
  clientName: string
  clientEmail: string
  treatmentTitle: string
  startsAt: Date
  amountCents: number
  clinicPhone?: string | null
  refunded?: boolean
}

function cancellationHtml(input: TreatmentCancellationInput, when: string): string {
  const bookUrl = `${getSiteUrl()}/book`
  const contactUrl = `${getSiteUrl()}/contact`
  const paid = formatAudFromCents(input.amountCents)
  const refundLine = input.refunded
    ? `<p style="margin:16px 0 0;color:#2c2420;font-size:14px;">A refund of <strong>${escapeHtml(paid)}</strong> will be returned to your original payment method within 5–10 business days.</p>`
    : ''

  const phoneLine = input.clinicPhone
    ? `<p style="margin:16px 0 0;text-align:center;font-size:14px;color:#6b5f58;">Or call us on <strong>${escapeHtml(input.clinicPhone)}</strong></p>`
    : ''

  return emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;text-align:center;color:#2c2420;">Your appointment has been cancelled</h1>
    <p style="margin:0 0 8px;">Hi ${escapeHtml(input.clientName)},</p>
    <p style="margin:0 0 20px;">Your <strong>${escapeHtml(input.treatmentTitle)}</strong> appointment (${escapeHtml(paid)} paid) has been cancelled:</p>
    <p style="margin:0;padding:16px 20px;background:#f0e6e8;border-radius:2px;text-align:center;font-size:16px;color:#2c2420;"><strong>${escapeHtml(when)}</strong></p>
    ${refundLine}
    <p style="margin:24px 0 0;text-align:center;color:#6b5f58;">We'd love to see you another time.</p>
    ${emailButton(bookUrl, 'Book a free consultation')}
    ${phoneLine}
    <p style="margin:20px 0 0;text-align:center;font-size:14px;">
      <a href="${contactUrl}" style="color:#9a6b73;text-decoration:underline;">Contact us</a> with any questions
    </p>
  `)
}

export async function sendTreatmentCancellationEmail(
  input: TreatmentCancellationInput,
): Promise<EmailSendResult> {
  if (!isClientEmailConfigured()) {
    return emailSkipped('Email not configured')
  }

  const to = input.clientEmail.trim()
  if (!to.includes('@')) {
    return emailSkipped('Invalid client email')
  }

  const when = formatConsultationWhen(input.startsAt)
  try {
    await sendEmail({
      to,
      subject: `${input.treatmentTitle} cancelled — ${when}`,
      html: cancellationHtml(input, when),
    })
    return emailSent()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Send failed'
    console.error('[email] treatment cancellation:', msg)
    return emailSkipped(msg)
  }
}
