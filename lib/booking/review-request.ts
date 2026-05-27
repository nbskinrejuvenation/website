import { sendReviewRequestEmail } from '@/lib/email/review-request'
import { buildReviewRequestSms } from '@/lib/sms/review-request'
import { normalizeAuPhone, isSmsConfigured } from '@/lib/sms/config'
import { sendSms } from '@/lib/sms/twilio'
import { createAdminClient } from '@/lib/supabase/admin'

export type ReviewBookingKind = 'consultation' | 'treatment'

export function getGoogleReviewUrl(): string | null {
  const url = process.env.GOOGLE_REVIEW_URL?.trim()
  return url && url.startsWith('http') ? url : null
}

export async function sendReviewRequestForBooking(
  kind: ReviewBookingKind,
  bookingId: string,
): Promise<{ sent: boolean }> {
  const reviewUrl = getGoogleReviewUrl()
  if (!reviewUrl) return { sent: false }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const table = kind === 'consultation' ? 'consultation_bookings' : 'treatment_bookings'

  const { data: booking, error } = await supabase
    .from(table)
    .select(`*, client:clients (*), treatment:treatments (title)`)
    .eq('id', bookingId)
    .single()

  if (error || !booking || booking.status !== 'completed' || booking.review_request_sent_at) {
    return { sent: false }
  }

  const client = Array.isArray(booking.client) ? booking.client[0] : booking.client
  if (!client) return { sent: false }

  const treatment = Array.isArray(booking.treatment) ? booking.treatment[0] : booking.treatment
  const label =
    kind === 'consultation' ? 'consultation' : treatment?.title ?? 'treatment'

  let sent = false

  if (client.email) {
    const emailResult = await sendReviewRequestEmail({
      clientName: client.full_name,
      clientEmail: client.email,
      appointmentLabel: label,
      reviewUrl,
    })
    if (emailResult.sent) sent = true
  }

  const phone = normalizeAuPhone(client.phone)
  if (phone && isSmsConfigured()) {
    const sms = await sendSms(
      phone,
      buildReviewRequestSms({ clientName: client.full_name, reviewUrl }),
    )
    if (sms.sent) sent = true
  }

  if (sent) {
    await supabase
      .from(table)
      .update({
        review_request_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .is('review_request_sent_at', null)
  }

  return { sent }
}
