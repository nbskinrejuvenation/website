import { PENDING_PAYMENT_HOLD_MINUTES } from '@/lib/booking/constants'
import { handleAbandonedTreatmentCheckout } from '@/lib/booking/abandoned-checkout'
import { createAdminClient } from '@/lib/supabase/admin'

export interface AbandonedCheckoutRunResult {
  candidates: number
  processed: number
  emailsSent: number
  failed: number
}

/** Catches expired Stripe holds if the webhook was missed. */
export async function processAbandonedCheckouts(): Promise<AbandonedCheckoutRunResult> {
  const cutoff = new Date(
    Date.now() - (PENDING_PAYMENT_HOLD_MINUTES + 5) * 60 * 1000,
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('treatment_bookings')
    .select('id')
    .eq('status', 'pending_payment')
    .lt('created_at', cutoff.toISOString())

  if (error) throw new Error(`abandoned-checkouts query: ${error.message}`)

  const ids = (data ?? []).map((r: { id: string }) => r.id)
  const result: AbandonedCheckoutRunResult = {
    candidates: ids.length,
    processed: 0,
    emailsSent: 0,
    failed: 0,
  }

  for (const id of ids) {
    try {
      const outcome = await handleAbandonedTreatmentCheckout(id)
      result.processed++
      if (outcome.emailSent) result.emailsSent++
    } catch (err) {
      console.error(`[abandoned-checkouts] ${id}:`, err)
      result.failed++
    }
  }

  return result
}
