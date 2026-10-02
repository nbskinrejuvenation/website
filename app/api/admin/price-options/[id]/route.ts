import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { deletePriceOptionAdmin, updatePriceOptionAdmin } from '@/lib/data/price-options-admin'

const patchSchema = z.object({
  group_name: z.string().trim().min(2).max(80).optional(),
  label: z.string().trim().min(1).max(160).optional(),
  price_cents: z.number().int().min(100).optional(),
  session_count: z.number().int().min(1).max(20).optional(),
  subtitle: z.string().trim().max(160).nullable().optional(),
  sort_order: z.number().int().optional(),
  active: z.boolean().optional(),
})

interface Props {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Props) {
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
    const option = await updatePriceOptionAdmin(id, result.data)
    revalidateTag('price-options')
    return NextResponse.json({ option })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed'
    console.error('[admin/price-options PATCH]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const { id } = await params
  try {
    await deletePriceOptionAdmin(id)
    revalidateTag('price-options')
    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error('[admin/price-options DELETE]', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
