import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getBookableTreatmentBySlug } from '@/lib/booking/get-bookable-treatment'
import { validatePromoCode } from '@/lib/promo/validate'
import {
  calculateChargeCents,
  formatAudFromCents,
  resolveDepositPercent,
} from '@/lib/stripe/config'

const schema = z.object({
  slug: z.string().min(1),
  code: z.string().min(1).max(50),
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

  const promoResult = await validatePromoCode(
    result.data.code,
    treatment.id,
    treatment.price_cents,
  )

  if (!promoResult.valid || !promoResult.promo) {
    return NextResponse.json({ valid: false, error: promoResult.error }, { status: 200 })
  }

  const afterDiscount = Math.max(0, treatment.price_cents - promoResult.promo.discountCents)
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
