import { getPackageById } from '@/lib/packages/credits'
import { validatePromoCode } from '@/lib/promo/validate'
import { calculateChargeCents } from '@/lib/stripe/config'
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

  const afterDiscount = Math.max(0, baseCents - discountCents)
  const chargeCents = afterDiscount === 0 ? 0 : calculateChargeCents(afterDiscount)

  return {
    baseCents,
    discountCents,
    chargeCents,
    promoCodeId,
    treatmentPackageId,
    packageSessionCount,
    promoLabel,
    requiresPayment: chargeCents > 0,
  }
}
