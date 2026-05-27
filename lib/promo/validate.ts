import { createAdminClient } from '@/lib/supabase/admin'

export type PromoDiscountType = 'percent' | 'fixed_cents'

export interface ValidatedPromo {
  id: string
  code: string
  discountType: PromoDiscountType
  discountValue: number
  discountCents: number
  description: string | null
}

export interface PromoValidationResult {
  valid: boolean
  promo?: ValidatedPromo
  error?: string
}

function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase()
}

export function calculatePromoDiscountCents(
  baseCents: number,
  discountType: PromoDiscountType,
  discountValue: number,
): number {
  if (baseCents <= 0) return 0
  if (discountType === 'percent') {
    const pct = Math.min(100, Math.max(1, discountValue))
    return Math.min(baseCents, Math.round((baseCents * pct) / 100))
  }
  return Math.min(baseCents, Math.max(1, discountValue))
}

export async function validatePromoCode(
  code: string,
  treatmentId: string,
  baseCents: number,
): Promise<PromoValidationResult> {
  const normalized = normalizePromoCode(code)
  if (!normalized) {
    return { valid: false, error: 'Enter a promo code.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data: promo, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', normalized)
    .maybeSingle()

  if (error) {
    console.error('[validatePromoCode]', error.message)
    return { valid: false, error: 'Could not validate promo code.' }
  }
  if (!promo) {
    return { valid: false, error: 'This promo code is not valid.' }
  }
  if (!promo.active) {
    return { valid: false, error: 'This promo code is no longer active.' }
  }

  const now = Date.now()
  if (promo.valid_from && new Date(promo.valid_from).getTime() > now) {
    return { valid: false, error: 'This promo code is not active yet.' }
  }
  if (promo.valid_until && new Date(promo.valid_until).getTime() < now) {
    return { valid: false, error: 'This promo code has expired.' }
  }
  if (promo.max_redemptions != null && promo.redemption_count >= promo.max_redemptions) {
    return { valid: false, error: 'This promo code has reached its usage limit.' }
  }
  if (promo.treatment_id && promo.treatment_id !== treatmentId) {
    return { valid: false, error: 'This promo code does not apply to this treatment.' }
  }

  const discountType = promo.discount_type as PromoDiscountType
  if (discountType === 'percent' && (promo.discount_value < 1 || promo.discount_value > 100)) {
    return { valid: false, error: 'Invalid promo configuration.' }
  }

  const discountCents = calculatePromoDiscountCents(baseCents, discountType, promo.discount_value)
  if (discountCents <= 0) {
    return { valid: false, error: 'This promo code does not apply to this booking.' }
  }

  return {
    valid: true,
    promo: {
      id: promo.id,
      code: promo.code,
      discountType,
      discountValue: promo.discount_value,
      discountCents,
      description: promo.description,
    },
  }
}

export async function incrementPromoRedemption(promoCodeId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data: row } = await supabase
    .from('promo_codes')
    .select('redemption_count, max_redemptions')
    .eq('id', promoCodeId)
    .single()

  if (!row) return
  if (row.max_redemptions != null && row.redemption_count >= row.max_redemptions) return

  await supabase
    .from('promo_codes')
    .update({
      redemption_count: row.redemption_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', promoCodeId)
}
