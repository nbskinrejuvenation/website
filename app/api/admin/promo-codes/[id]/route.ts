import { NextResponse } from 'next/server'
import { z } from 'zod'
import { updatePromoCodeAdmin } from '@/lib/data/promotions-admin'

const patchSchema = z.object({
  active: z.boolean().optional(),
  description: z.string().max(500).optional(),
  max_redemptions: z.number().int().positive().nullable().optional(),
  valid_until: z.string().datetime().nullable().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = patchSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 422 })
  }

  try {
    const promo = await updatePromoCodeAdmin(id, result.data)
    return NextResponse.json({ promo })
  } catch (err) {
    console.error('[admin/promo-codes PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
