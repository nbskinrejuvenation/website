import Stripe from 'stripe'
import { isStripeConfigured } from '@/lib/stripe/config'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.')
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }
  return stripeClient
}
