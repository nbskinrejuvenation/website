import { getSiteUrl } from '@/lib/email/resend'
import { normalizeAuPhone, isSmsConfigured } from '@/lib/sms/config'
import { sendSms } from '@/lib/sms/twilio'

export interface ClinicBookingAlertInput {
  kind: 'consultation' | 'treatment'
  clientName: string
  when: string
  label: string
  amountLabel?: string | null
}

function buildMessage(input: ClinicBookingAlertInput): string {
  const paid = input.amountLabel ? ` · ${input.amountLabel}` : ''
  const type = input.kind === 'consultation' ? 'New consultation' : 'New paid booking'
  return `${type}: ${input.clientName} — ${input.label} on ${input.when}${paid}`
}

export async function notifyClinicNewBooking(input: ClinicBookingAlertInput): Promise<void> {
  const message = buildMessage(input)
  const adminUrl = `${getSiteUrl()}/admin/appointments`

  const webhook = process.env.SLACK_WEBHOOK_URL?.trim()
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          blocks: [
            {
              type: 'section',
              text: { type: 'mrkdwn', text: `*${message}*` },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'Open admin' },
                  url: adminUrl,
                },
              ],
            },
          ],
        }),
      })
    } catch (err) {
      console.error('[clinic-alert] Slack:', err)
    }
  }

  const clinicPhone = normalizeAuPhone(process.env.CLINIC_SMS_PHONE)
  if (clinicPhone && isSmsConfigured()) {
    const smsResult = await sendSms(clinicPhone, `${message} ${adminUrl}`)
    if (!smsResult.sent) {
      console.error('[clinic-alert] SMS:', smsResult.error)
    }
  }
}
