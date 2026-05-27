import { Resend } from 'resend'

export function getEmailFrom(): string {
  const from = process.env.EMAIL_FROM?.trim()
  if (!from) throw new Error('EMAIL_FROM is not set')
  if (!from.includes('@')) {
    throw new Error(
      `EMAIL_FROM looks truncated (got "${from}"). In .env.local use quotes: EMAIL_FROM="Naturally Beautiful <bookings@yourdomain.com.au>"`,
    )
  }
  return from
}

/** Minimum config to email clients (confirmations, reminders, cancellations). */
export function isClientEmailConfigured(): boolean {
  try {
    return Boolean(process.env.RESEND_API_KEY?.trim() && getEmailFrom())
  } catch {
    return false
  }
}

/** Full config including clinic inbox alerts on new bookings. */
export function isEmailConfigured(): boolean {
  return Boolean(
    isClientEmailConfigured() && process.env.CLINIC_NOTIFICATION_EMAIL?.trim(),
  )
}

export function emailButton(href: string, label: string): string {
  return `<p style="margin:28px 0 0;text-align:center;">
  <a href="${href}" style="display:inline-block;padding:14px 32px;background:#7d4a54;color:#faf7f4 !important;text-decoration:none;border-radius:2px;font-size:15px;font-weight:500;">${label}</a>
</p>`
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
  const from = getEmailFrom()

  const resend = getResendClient()
  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  })

  if (error) {
    throw new Error(error.message)
  }
  if (!data?.id) {
    throw new Error('Resend accepted the request but returned no message id')
  }
}

export { getSiteUrl, SITE_URL } from '@/lib/site/url'

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
