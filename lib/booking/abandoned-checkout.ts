import { sendAbandonedCheckoutEmail } from '@/lib/email/abandoned-checkout'
import { getBookableTreatmentById } from '@/lib/booking/get-bookable-treatment'
import { cancelPendingTreatmentBooking } from '@/lib/booking/confirm-treatment-payment'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Client } from '@/types/database'

export async function handleAbandonedTreatmentCheckout(bookingId: string): Promise<{
  emailSent: boolean
  cancelled: boolean
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: booking, error } = await supabase
    .from('treatment_bookings')
    .select(`*, client:clients (*)`)
    .eq('id', bookingId)
    .maybeSingle()

  if (error) throw new Error(`handleAbandonedTreatmentCheckout: ${error.message}`)
  if (!booking) return { emailSent: false, cancelled: false }

  if (booking.status !== 'pending_payment') {
    return { emailSent: false, cancelled: false }
  }

  if (booking.abandoned_checkout_email_sent_at) {
    await cancelPendingTreatmentBooking(bookingId)
    return { emailSent: false, cancelled: true }
  }

  const clientRaw = booking.client
  const client = (Array.isArray(clientRaw) ? clientRaw[0] : clientRaw) as Client | null
  const treatment = await getBookableTreatmentById(booking.treatment_id)

  let emailSent = false
  if (client?.email && treatment) {
    const result = await sendAbandonedCheckoutEmail({
      clientName: client.full_name,
      clientEmail: client.email,
      treatmentTitle: treatment.title,
      treatmentSlug: treatment.slug,
      startsAt: new Date(booking.starts_at),
    })
    emailSent = result.sent

    if (result.sent) {
      await supabase
        .from('treatment_bookings')
        .update({
          abandoned_checkout_email_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
    }
  }

  await cancelPendingTreatmentBooking(bookingId)
  return { emailSent, cancelled: true }
}
