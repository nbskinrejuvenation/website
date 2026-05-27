import { emailLayout } from '@/lib/email/layout'
import { emailButton, escapeHtml, isClientEmailConfigured, sendEmail } from '@/lib/email/resend'

export interface ReviewRequestEmailInput {
  clientName: string
  clientEmail: string
  appointmentLabel: string
  reviewUrl: string
}

export async function sendReviewRequestEmail(
  input: ReviewRequestEmailInput,
): Promise<{ sent: boolean }> {
  if (!isClientEmailConfigured()) return { sent: false }

  const html = emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;text-align:center;color:#2c2420;">Thank you for visiting us</h1>
    <p style="margin:0 0 8px;">Hi ${escapeHtml(input.clientName)},</p>
    <p style="margin:0 0 20px;">We hope you enjoyed your ${escapeHtml(input.appointmentLabel)} at Naturally Beautiful. If you have a moment, we would love to hear about your experience.</p>
    ${emailButton(input.reviewUrl, 'Leave a Google review')}
    <p style="margin:24px 0 0;font-size:14px;color:#6b5f58;">Your feedback helps other clients find us and helps us improve our care.</p>
  `)

  try {
    await sendEmail({
      to: input.clientEmail,
      subject: 'How was your visit? — Naturally Beautiful',
      html,
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] review-request:', err)
    return { sent: false }
  }
}
