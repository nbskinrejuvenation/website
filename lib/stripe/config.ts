export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim())
}

export function getStripeDepositPercent(): number {
  const raw = process.env.STRIPE_DEPOSIT_PERCENT?.trim()
  const parsed = raw ? Number.parseInt(raw, 10) : 100
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 100) return 100
  return parsed
}

export function calculateChargeCents(priceCents: number): number {
  const percent = getStripeDepositPercent()
  return Math.max(50, Math.round((priceCents * percent) / 100))
}

export function formatAudFromCents(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}
