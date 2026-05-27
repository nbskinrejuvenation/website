import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateTreatmentBooking } from '@/lib/data/treatment-bookings-admin'
import type { TreatmentBookingStatus } from '@/types/database'

const patchSchema = z.object({
  status: z
    .enum(['confirmed', 'cancelled', 'completed', 'no_show', 'pending_payment'])
    .optional(),
  internal_notes: z.string().max(5000).nullable().optional(),
  no_show_notes: z.string().max(2000).nullable().optional(),
  refund: z.boolean().optional(),
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

  if (
    !result.data.status &&
    result.data.internal_notes === undefined &&
    result.data.no_show_notes === undefined
  ) {
    return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
  }

  try {
    const { booking, calendarEventRemoved, cancellationEmail, refund } =
      await updateTreatmentBooking(id, {
        status: result.data.status as TreatmentBookingStatus | undefined,
        internal_notes: result.data.internal_notes,
        no_show_notes: result.data.no_show_notes,
        refund: result.data.refund,
      })
    return NextResponse.json({ booking, calendarEventRemoved, cancellationEmail, refund })
  } catch (err) {
    console.error('[admin/treatment-bookings PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
