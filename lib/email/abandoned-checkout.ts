import { emailLayout, formatConsultationWhen } from '@/lib/email/layout'
import { emailButton, escapeHtml, getSiteUrl, isClientEmailConfigured, sendEmail } from '@/lib/email/resend'

export interface AbandonedCheckoutEmailInput {
  clientName: string
  clientEmail: string
  treatmentTitle: string
  treatmentSlug: string
  startsAt: Date
}

function abandonedHtml(input: AbandonedCheckoutEmailInput, when: string): string {
  const rebookUrl = `${getSiteUrl()}/book/treatment/${input.treatmentSlug}`

  return emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;text-align:center;color:#2c2420;">Complete your booking</h1>
    <p style="margin:0 0 8px;">Hi ${escapeHtml(input.clientName)},</p>
    <p style="margin:0 0 20px;">You started booking <strong>${escapeHtml(input.treatmentTitle)}</strong> but didn&apos;t finish checkout. Your time slot may still be available.</p>
    <p style="margin:0;padding:16px 20px;background:#f0e6e8;border-radius:2px;text-align:center;font-size:16px;color:#2c2420;"><strong>${escapeHtml(when)}</strong></p>
    ${emailButton(rebookUrl, 'Complete booking')}
    <p style="margin:24px 0 0;font-size:14px;color:#6b5f58;">If you had trouble paying or need help, reply to this email or call the clinic.</p>
  `)
}

export async function sendAbandonedCheckoutEmail(
  input: AbandonedCheckoutEmailInput,
): Promise<{ sent: boolean; error: string | null }> {
  if (!isClientEmailConfigured()) {
    return { sent: false, error: 'Email not configured' }
  }

  const when = formatConsultationWhen(input.startsAt)

  try {
    await sendEmail({
      to: input.clientEmail,
      subject: `Complete your ${input.treatmentTitle} booking`,
      html: abandonedHtml(input, when),
    })
    return { sent: true, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Send failed'
    console.error('[email] abandoned-checkout:', message)
    return { sent: false, error: message }
  }
}
