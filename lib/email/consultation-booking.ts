import { CONSULTATION_DURATION_MINUTES } from '@/lib/booking/constants'
import { getManageBookingUrl } from '@/lib/booking/management-url'
import { emailLayout, formatConsultationWhen } from '@/lib/email/layout'
import { emailButton, escapeHtml, getSiteUrl, isEmailConfigured, sendEmail } from '@/lib/email/resend'

export interface ConsultationBookingEmailInput {
  clientName: string
  clientEmail: string
  clientPhone?: string | null
  treatmentInterest?: string | null
  message?: string | null
  startsAt: Date
  calendarSynced: boolean
  bookingId: string
  managementToken?: string | null
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
    ${
      input.managementToken
        ? emailButton(getManageBookingUrl(input.managementToken), 'Reschedule or cancel')
        : ''
    }
    <p style="margin:24px 0 0;">We look forward to meeting you at our Dee Why clinic.${
      input.managementToken
        ? ' Use the button above to change your appointment online.'
        : ' If you need to change your appointment, please call us or reply to this email.'
    }</p>
  `)
}

function clinicNotificationHtml(input: ConsultationBookingEmailInput, when: string): string {
  const adminUrl = `${getSiteUrl()}/admin/appointments`
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

  const when = formatConsultationWhen(input.startsAt)
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
