import { isSmsConfigured } from '@/lib/sms/config'

export interface SendSmsResult {
  sent: boolean
  error: string | null
}

export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  if (!isSmsConfigured()) {
    return { sent: false, error: 'SMS not configured' }
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!.trim()
  const authToken = process.env.TWILIO_AUTH_TOKEN!.trim()
  const from = process.env.TWILIO_FROM_NUMBER!.trim()

  const params = new URLSearchParams({ To: to, From: from, Body: body })
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      },
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('[twilio]', text)
      return { sent: false, error: 'SMS delivery failed' }
    }

    return { sent: true, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SMS failed'
    console.error('[twilio]', message)
    return { sent: false, error: message }
  }
}
