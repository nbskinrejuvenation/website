import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { handleAbandonedTreatmentCheckout } from '@/lib/booking/abandoned-checkout'
import { confirmTreatmentPayment } from '@/lib/booking/confirm-treatment-payment'
import { getStripe } from '@/lib/stripe/client'
import { isStripeConfigured } from '@/lib/stripe/config'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const body = await request.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    console.error('[stripe/webhook]', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.metadata?.booking_type === 'treatment' && session.metadata.booking_id) {
        await confirmTreatmentPayment({
          bookingId: session.metadata.booking_id,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
        })
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.metadata?.booking_type === 'treatment' && session.metadata.booking_id) {
        await handleAbandonedTreatmentCheckout(session.metadata.booking_id)
      }
    }
  } catch (err) {
    console.error('[stripe/webhook] handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
