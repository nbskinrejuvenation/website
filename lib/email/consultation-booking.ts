import { CLINIC_ADDRESS_FULL } from '@/lib/site/address'
import { CLINIC_TIMEZONE, CONSULTATION_DURATION_MINUTES } from '@/lib/booking/constants'
import { escapeHtml, getSiteUrl, isEmailConfigured, sendEmail } from '@/lib/email/resend'

export interface ConsultationBookingEmailInput {
  clientName: string
  clientEmail: string
  clientPhone?: string | null
  treatmentInterest?: string | null
  message?: string | null
  startsAt: Date
  calendarSynced: boolean
  bookingId: string
}

function formatWhen(date: Date): string {
  return date.toLocaleString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: CLINIC_TIMEZONE,
  })
}

function emailLayout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f0ed;font-family:Georgia,'Times New Roman',serif;color:#2c2420;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ed;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#faf7f4;border:1px solid #e8ddd6;border-radius:2px;">
        <tr><td style="padding:28px 32px 8px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9a6b73;">Naturally Beautiful</p>
        </td></tr>
        <tr><td style="padding:8px 32px 32px;font-size:15px;line-height:1.65;">
          ${body}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #e8ddd6;font-size:12px;line-height:1.5;color:#6b5f58;text-align:center;">
          ${escapeHtml(CLINIC_ADDRESS_FULL)}<br>
          <a href="${getSiteUrl()}" style="color:#9a6b73;">nbskinrejuvenation.com.au</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function clientConfirmationHtml(input: ConsultationBookingEmailInput, when: string): string {
  const calendarNote = input.calendarSynced
    ? '<p style="margin:16px 0 0;color:#6b5f58;font-size:14px;">A calendar invitation has also been sent to this email address.</p>'
    : ''

  return emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;text-align:center;color:#2c2420;">Your consultation is confirmed</h1>
    <p style="margin:0 0 8px;">Hi ${escapeHtml(input.clientName)},</p>
    <p style="margin:0 0 20px;">Thank you for booking a complimentary ${CONSULTATION_DURATION_MINUTES}-minute skin consultation with us.</p>
    <p style="margin:0;padding:16px 20px;background:#f0e6e8;border-radius:2px;text-align:center;font-size:16px;color:#2c2420;"><strong>${escapeHtml(when)}</strong></p>
    ${calendarNote}
    <p style="margin:24px 0 0;">We look forward to meeting you at our Dee Why clinic. If you need to change your appointment, please call us or reply to this email.</p>
  `)
}

function clinicNotificationHtml(input: ConsultationBookingEmailInput, when: string): string {
  const adminUrl = `${getSiteUrl()}/admin/consultations`
  const rows = [
    ['When', when],
    ['Name', input.clientName],
    ['Email', input.clientEmail],
    input.clientPhone ? ['Phone', input.clientPhone] : null,
    input.treatmentInterest ? ['Interest', input.treatmentInterest] : null,
    input.message ? ['Message', input.message] : null,
  ].filter(Boolean) as Array<[string, string]>

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#6b5f58;vertical-align:top;width:100px;">${escapeHtml(label)}</td><td style="padding:8px 0;color:#2c2420;">${escapeHtml(value)}</td></tr>`,
    )
    .join('')

  return emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;text-align:center;color:#2c2420;">New consultation booked</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${tableRows}</table>
    <p style="margin:0;text-align:center;">
      <a href="${adminUrl}" style="display:inline-block;padding:12px 24px;background:#7d4a54;color:#faf7f4;text-decoration:none;border-radius:2px;font-size:14px;">Open admin inbox</a>
    </p>
  `)
}

async function sendClientConfirmation(
  input: ConsultationBookingEmailInput,
  when: string,
): Promise<void> {
  await sendEmail({
    to: input.clientEmail,
    subject: `Consultation confirmed — ${when}`,
    html: clientConfirmationHtml(input, when),
  })
}

async function sendClinicNotification(
  input: ConsultationBookingEmailInput,
  when: string,
): Promise<void> {
  const clinicEmail = process.env.CLINIC_NOTIFICATION_EMAIL!.trim()
  await sendEmail({
    to: clinicEmail,
    subject: `New booking: ${input.clientName} — ${when}`,
    html: clinicNotificationHtml(input, when),
  })
}

/** Sends client confirmation + clinic alert. Never throws — logs errors instead. */
export async function sendConsultationBookingEmails(
  input: ConsultationBookingEmailInput,
): Promise<{ clientSent: boolean; clinicSent: boolean }> {
  if (!isEmailConfigured()) {
    console.warn('[email] Resend not configured — skipping booking emails')
    return { clientSent: false, clinicSent: false }
  }

  const when = formatWhen(input.startsAt)
  let clientSent = false
  let clinicSent = false

  try {
    await sendClientConfirmation(input, when)
    clientSent = true
  } catch (err) {
    console.error('[email] client confirmation:', err)
  }

  try {
    await sendClinicNotification(input, when)
    clinicSent = true
  } catch (err) {
    console.error('[email] clinic notification:', err)
  }

  return { clientSent, clinicSent }
}
