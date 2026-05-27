import { getManageBookingUrl } from '@/lib/booking/management-url'
import { emailLayout, formatConsultationWhen } from '@/lib/email/layout'
import { emailButton, escapeHtml, getSiteUrl, isEmailConfigured, sendEmail } from '@/lib/email/resend'
import { formatAudFromCents } from '@/lib/stripe/config'

export interface TreatmentBookingEmailInput {
  clientName: string
  clientEmail: string
  clientPhone?: string | null
  treatmentTitle: string
  message?: string | null
  startsAt: Date
  amountCents: number
  calendarSynced: boolean
  bookingId: string
  managementToken?: string | null
}

function clientConfirmationHtml(input: TreatmentBookingEmailInput, when: string): string {
  const paid = formatAudFromCents(input.amountCents)
  const calendarNote = input.calendarSynced
    ? '<p style="margin:16px 0 0;color:#6b5f58;font-size:14px;">A calendar invitation has also been sent to this email address.</p>'
    : ''

  return emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;text-align:center;color:#2c2420;">Your appointment is confirmed</h1>
    <p style="margin:0 0 8px;">Hi ${escapeHtml(input.clientName)},</p>
    <p style="margin:0 0 20px;">Thank you for booking <strong>${escapeHtml(input.treatmentTitle)}</strong> with us. We have received your payment of <strong>${escapeHtml(paid)}</strong>.</p>
    <p style="margin:0;padding:16px 20px;background:#f0e6e8;border-radius:2px;text-align:center;font-size:16px;color:#2c2420;"><strong>${escapeHtml(when)}</strong></p>
    ${calendarNote}
    ${
      input.managementToken
        ? `${emailButton(getManageBookingUrl(input.managementToken), 'Reschedule or cancel')}
    <p style="margin:12px 0 0;text-align:center;">
      <a href="${getManageBookingUrl(input.managementToken)}#intake" style="color:#9a6b73;font-size:14px;text-decoration:underline;">Complete pre-visit form</a>
    </p>`
        : ''
    }
    <p style="margin:24px 0 0;">We look forward to seeing you at our Dee Why clinic.${
      input.managementToken
        ? ' Use the button above to change your appointment online.'
        : ' If you need to change your appointment, please call us or reply to this email.'
    }</p>
  `)
}

function clinicNotificationHtml(input: TreatmentBookingEmailInput, when: string): string {
  const adminUrl = `${getSiteUrl()}/admin/appointments?kind=treatment`
  const paid = formatAudFromCents(input.amountCents)
  const rows = [
    ['Treatment', input.treatmentTitle],
    ['When', when],
    ['Paid', paid],
    ['Name', input.clientName],
    ['Email', input.clientEmail],
    input.clientPhone ? ['Phone', input.clientPhone] : null,
    input.message ? ['Notes', input.message] : null,
  ].filter(Boolean) as Array<[string, string]>

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#6b5f58;vertical-align:top;width:100px;">${escapeHtml(label)}</td><td style="padding:8px 0;color:#2c2420;">${escapeHtml(value)}</td></tr>`,
    )
    .join('')

  return emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;text-align:center;color:#2c2420;">New paid treatment booking</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${tableRows}</table>
    <p style="margin:0;text-align:center;">
      <a href="${adminUrl}" style="display:inline-block;padding:12px 24px;background:#7d4a54;color:#faf7f4;text-decoration:none;border-radius:2px;font-size:14px;">Open treatment bookings</a>
    </p>
  `)
}

export async function sendTreatmentBookingEmails(
  input: TreatmentBookingEmailInput,
): Promise<{ clientSent: boolean; clinicSent: boolean }> {
  if (!isEmailConfigured()) {
    return { clientSent: false, clinicSent: false }
  }

  const when = formatConsultationWhen(input.startsAt)
  let clientSent = false
  let clinicSent = false

  try {
    await sendEmail({
      to: input.clientEmail,
      subject: `${input.treatmentTitle} confirmed — ${when}`,
      html: clientConfirmationHtml(input, when),
    })
    clientSent = true
  } catch (err) {
    console.error('[treatment-booking-email] client:', err)
  }

  const clinicEmail = process.env.CLINIC_NOTIFICATION_EMAIL?.trim()
  if (clinicEmail) {
    try {
      await sendEmail({
        to: clinicEmail,
        subject: `Paid booking: ${input.treatmentTitle} — ${input.clientName}`,
        html: clinicNotificationHtml(input, when),
      })
      clinicSent = true
    } catch (err) {
      console.error('[treatment-booking-email] clinic:', err)
    }
  }

  return { clientSent, clinicSent }
}
