import { getPackageById } from '@/lib/packages/credits'
import { validatePromoCode } from '@/lib/promo/validate'
import { calculateChargeCents, resolveDepositPercent } from '@/lib/stripe/config'
import type { BookableTreatment } from '@/types/database'

export interface TreatmentBookingPricingInput {
  treatment: BookableTreatment
  packageId?: string
  promoCode?: string
  usePackageCredit?: boolean
}

export interface TreatmentBookingPricing {
  baseCents: number
  discountCents: number
  chargeCents: number
  /** Percent of the (discounted) price charged now; 100 = paid in full. */
  depositPercent: number
  /** Left to pay at the clinic. */
  balanceCents: number
  promoCodeId: string | null
  treatmentPackageId: string | null
  packageSessionCount: number | null
  promoLabel: string | null
  requiresPayment: boolean
}

export async function resolveTreatmentBookingPricing(
  input: TreatmentBookingPricingInput,
): Promise<TreatmentBookingPricing> {
  if (input.usePackageCredit) {
    return {
      baseCents: input.treatment.price_cents!,
      discountCents: input.treatment.price_cents!,
      chargeCents: 0,
      depositPercent: 100,
      balanceCents: 0,
      promoCodeId: null,
      treatmentPackageId: null,
      packageSessionCount: null,
      promoLabel: null,
      requiresPayment: false,
    }
  }

  let baseCents = input.treatment.price_cents!
  let treatmentPackageId: string | null = null
  let packageSessionCount: number | null = null

  if (input.packageId) {
    const pkg = await getPackageById(input.packageId, input.treatment.id)
    if (!pkg) {
      throw new Error('Selected package is not available.')
    }
    baseCents = pkg.price_cents
    treatmentPackageId = pkg.id
    packageSessionCount = pkg.session_count
  }

  let discountCents = 0
  let promoCodeId: string | null = null
  let promoLabel: string | null = null

  if (input.promoCode?.trim() && !input.packageId) {
    const promoResult = await validatePromoCode(
      input.promoCode,
      input.treatment.id,
      baseCents,
    )
    if (!promoResult.valid || !promoResult.promo) {
      throw new Error(promoResult.error ?? 'Invalid promo code.')
    }
    discountCents = promoResult.promo.discountCents
    promoCodeId = promoResult.promo.id
    promoLabel = promoResult.promo.code
  }

  // Packages are prepaid in full: their credits book later sessions with no
  // payment, so there is no visit at which a package balance would be collected.
  const depositPercent = treatmentPackageId
    ? 100
    : resolveDepositPercent(input.treatment.deposit_percent)
  const afterDiscount = Math.max(0, baseCents - discountCents)
  const chargeCents =
    afterDiscount === 0 ? 0 : calculateChargeCents(afterDiscount, depositPercent)

  return {
    baseCents,
    discountCents,
    chargeCents,
    depositPercent,
    balanceCents: Math.max(0, afterDiscount - chargeCents),
    promoCodeId,
    treatmentPackageId,
    packageSessionCount,
    promoLabel,
    requiresPayment: chargeCents > 0,
  }
}
