import { getStripe } from '@/lib/stripe/client'
import { isStripeConfigured } from '@/lib/stripe/config'

export interface RefundResult {
  refundId: string
  amountCents: number
}

export async function refundPaymentIntent(
  paymentIntentId: string,
  amountCents?: number,
): Promise<RefundResult> {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured.')
  }

  const stripe = getStripe()
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amountCents ? { amount: amountCents } : {}),
  })

  return {
    refundId: refund.id,
    amountCents: refund.amount,
  }
}
