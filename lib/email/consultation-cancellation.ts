import { CONSULTATION_DURATION_MINUTES } from '@/lib/booking/constants'
import { emailLayout, formatConsultationWhen } from '@/lib/email/layout'
import { escapeHtml, getSiteUrl, isEmailConfigured, sendEmail } from '@/lib/email/resend'

export interface ConsultationCancellationInput {
  clientName: string
  clientEmail: string
  startsAt: Date
  clinicPhone?: string | null
}

function cancellationHtml(input: ConsultationCancellationInput, when: string): string {
  const bookUrl = `${getSiteUrl()}/book`
  const contactUrl = `${getSiteUrl()}/contact`
  const phoneBlock = input.clinicPhone
    ? `call us on <strong>${escapeHtml(input.clinicPhone)}</strong> or `
    : ''

  return emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;text-align:center;color:#2c2420;">Your consultation has been cancelled</h1>
    <p style="margin:0 0 8px;">Hi ${escapeHtml(input.clientName)},</p>
    <p style="margin:0 0 20px;">Your complimentary ${CONSULTATION_DURATION_MINUTES}-minute skin consultation has been cancelled:</p>
    <p style="margin:0;padding:16px 20px;background:#f0e6e8;border-radius:2px;text-align:center;font-size:16px;color:#2c2420;"><strong>${escapeHtml(when)}</strong></p>
    <p style="margin:24px 0 0;">We're sorry we won't see you at this time. When you're ready, you can ${phoneBlock}<a href="${bookUrl}" style="color:#9a6b73;">book a new time online</a> or <a href="${contactUrl}" style="color:#9a6b73;">contact us</a>.</p>
  `)
}

/** Sends cancellation notice to the client. Returns false if skipped or failed. */
export async function sendConsultationCancellationEmail(
  input: ConsultationCancellationInput,
): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn('[email] Resend not configured — skipping cancellation email')
    return false
  }

  const when = formatConsultationWhen(input.startsAt)
  try {
    await sendEmail({
      to: input.clientEmail,
      subject: `Consultation cancelled — ${when}`,
      html: cancellationHtml(input, when),
    })
    return true
  } catch (err) {
    console.error('[email] cancellation:', err)
    return false
  }
}
