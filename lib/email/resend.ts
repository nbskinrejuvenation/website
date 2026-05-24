import { Resend } from 'resend'

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.EMAIL_FROM?.trim() &&
      process.env.CLINIC_NOTIFICATION_EMAIL?.trim(),
  )
}

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')
  return new Resend(apiKey)
}

export async function sendEmail(input: {
  to: string | string[]
  subject: string
  html: string
}): Promise<void> {
  const from = process.env.EMAIL_FROM?.trim()
  if (!from) throw new Error('EMAIL_FROM is not set')

  const resend = getResendClient()
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nbskinrejuvenation.com.au').replace(
    /\/$/,
    '',
  )
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
