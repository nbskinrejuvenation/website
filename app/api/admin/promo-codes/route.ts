import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createPromoCodeAdmin, listPromoCodesAdmin } from '@/lib/data/promotions-admin'

const createSchema = z.object({
  code: z.string().min(2).max(40),
  description: z.string().max(500).optional(),
  discount_type: z.enum(['percent', 'fixed_cents']),
  discount_value: z.number().int().positive(),
  treatment_id: z.string().uuid().nullable().optional(),
  valid_from: z.string().datetime().nullable().optional(),
  valid_until: z.string().datetime().nullable().optional(),
  max_redemptions: z.number().int().positive().nullable().optional(),
})

export async function GET() {
  try {
    const promos = await listPromoCodesAdmin()
    return NextResponse.json({ promos })
  } catch (err) {
    console.error('[admin/promo-codes GET]', err)
    return NextResponse.json({ error: 'Failed to load promo codes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Validation failed', issues: result.error.issues }, { status: 422 })
  }

  if (result.data.discount_type === 'percent' && result.data.discount_value > 100) {
    return NextResponse.json({ error: 'Percent discount cannot exceed 100' }, { status: 422 })
  }

  try {
    const promo = await createPromoCodeAdmin(result.data)
    return NextResponse.json({ promo }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Create failed'
    const status = message.includes('unique') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
