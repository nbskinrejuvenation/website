import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateTreatmentBookingSettings } from '@/lib/data/treatments-admin'

const patchSchema = z.object({
  price_cents: z.number().int().min(50),
  duration_minutes: z.number().int().min(15).max(240),
  bookable_online: z.boolean(),
})

interface Props {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Props) {
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
    const treatment = await updateTreatmentBookingSettings(id, result.data)
    return NextResponse.json({ treatment })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed'
    console.error('[admin/treatments PATCH]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
