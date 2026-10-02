import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createPriceOptionAdmin } from '@/lib/data/price-options-admin'

const createSchema = z.object({
  treatment_id: z.string().uuid(),
  group_name: z.string().trim().min(2).max(80),
  label: z.string().trim().min(1).max(160),
  price_cents: z.number().int().min(100),
  session_count: z.number().int().min(1).max(20),
  subtitle: z.string().trim().max(160).nullable(),
  sort_order: z.number().int(),
  active: z.boolean(),
})

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

  try {
    const option = await createPriceOptionAdmin(result.data)
    revalidateTag('price-options')
    return NextResponse.json({ option }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Create failed'
    console.error('[admin/price-options POST]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
