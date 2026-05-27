import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isValidManagementToken } from '@/lib/booking/manage-appointment'
import { resolveBookingIdByToken } from '@/lib/booking/manage-appointment-intake'
import { upsertBookingIntake } from '@/lib/data/booking-intake'

const schema = z.object({
  skin_concerns: z.string().max(2000).optional(),
  medications: z.string().max(2000).optional(),
  allergies: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
})

interface Props {
  params: Promise<{ token: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
  const { token } = await params
  if (!isValidManagementToken(token)) {
    return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
  }

  const resolved = await resolveBookingIdByToken(token)
  if (!resolved) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 422 })
  }

  try {
    const intake = await upsertBookingIntake({
      kind: resolved.kind,
      bookingId: resolved.id,
      ...parsed.data,
    })
    return NextResponse.json({ intake })
  } catch (err) {
    console.error('[manage/intake POST]', err)
    return NextResponse.json({ error: 'Failed to save intake' }, { status: 500 })
  }
}
