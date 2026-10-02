import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getBookableTreatmentBySlug } from '@/lib/booking/get-bookable-treatment'
import { getActivePriceOption } from '@/lib/data/price-options-admin'
import { validatePromoCode } from '@/lib/promo/validate'
import {
  calculateChargeCents,
  formatAudFromCents,
  resolveDepositPercent,
} from '@/lib/stripe/config'

const schema = z.object({
  slug: z.string().min(1),
  code: z.string().min(1).max(50),
  price_option_id: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 422 })
  }

  const treatment = await getBookableTreatmentBySlug(result.data.slug)
  if (!treatment?.price_cents) {
    return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
  }

  let baseCents = treatment.price_cents
  if (result.data.price_option_id) {
    const option = await getActivePriceOption(result.data.price_option_id, treatment.id)
    if (!option) {
      return NextResponse.json({ valid: false, error: 'This price option is no longer available.' }, { status: 200 })
    }
    if (option.session_count > 1) {
      return NextResponse.json({ valid: false, error: 'Promo codes apply to single sessions only.' }, { status: 200 })
    }
    baseCents = option.price_cents
  }

  const promoResult = await validatePromoCode(
    result.data.code,
    treatment.id,
    baseCents,
  )

  if (!promoResult.valid || !promoResult.promo) {
    return NextResponse.json({ valid: false, error: promoResult.error }, { status: 200 })
  }

  const afterDiscount = Math.max(0, baseCents - promoResult.promo.discountCents)
  const chargeCents =
    afterDiscount === 0
      ? 0
      : calculateChargeCents(afterDiscount, resolveDepositPercent(treatment.deposit_percent))
  const balanceCents = Math.max(0, afterDiscount - chargeCents)

  return NextResponse.json({
    valid: true,
    chargeLabel: formatAudFromCents(chargeCents),
    balanceLabel: balanceCents > 0 ? formatAudFromCents(balanceCents) : null,
    code: promoResult.promo.code,
    discountCents: promoResult.promo.discountCents,
    discountLabel: formatAudFromCents(promoResult.promo.discountCents),
    description: promoResult.promo.description,
  })
}
