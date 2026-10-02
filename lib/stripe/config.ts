export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim())
}

/** Clinic-wide default, used when a treatment has no deposit_percent of its own. */
export function getStripeDepositPercent(): number {
  const raw = process.env.STRIPE_DEPOSIT_PERCENT?.trim()
  const parsed = raw ? Number.parseInt(raw, 10) : 100
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 100) return 100
  return parsed
}

/** A treatment's own deposit_percent, else the clinic default. */
export function resolveDepositPercent(treatmentPercent?: number | null): number {
  if (treatmentPercent != null && treatmentPercent >= 1 && treatmentPercent <= 100) {
    return treatmentPercent
  }
  return getStripeDepositPercent()
}

/**
 * Amount charged online. Deposits are rounded to whole dollars so the amount
 * shown by formatAudFromCents (no cents) is exactly what Stripe charges.
 */
export function calculateChargeCents(
  priceCents: number,
  percent: number = getStripeDepositPercent(),
): number {
  if (percent >= 100) return Math.max(50, priceCents)
  const depositCents = Math.round((priceCents * percent) / 100 / 100) * 100
  return Math.max(50, depositCents)
}

export function formatAudFromCents(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}
