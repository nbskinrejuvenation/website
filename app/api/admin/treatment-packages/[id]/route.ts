import { NextResponse } from 'next/server'
import { z } from 'zod'
import { updateTreatmentPackageAdmin } from '@/lib/data/promotions-admin'

const patchSchema = z.object({
  label: z.string().min(2).max(120).optional(),
  session_count: z.number().int().min(2).max(20).optional(),
  price_cents: z.number().int().min(50).optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
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
    const pkg = await updateTreatmentPackageAdmin(id, result.data)
    return NextResponse.json({ package: pkg })
  } catch (err) {
    console.error('[admin/treatment-packages PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
