import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isValidManagementToken, rescheduleBookingByToken } from '@/lib/booking/manage-appointment'

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
})

interface Props {
  params: Promise<{ token: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
  const { token } = await params

  if (!isValidManagementToken(token)) {
    return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
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
    const outcome = await rescheduleBookingByToken(token, parsed.data.date, parsed.data.time)
    if (!outcome) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, ...outcome })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Reschedule failed'
    const status =
      message.includes('not available') ||
      message.includes('just booked') ||
      message.includes('cannot') ||
      message.includes('hours before')
        ? 409
        : 500
    console.error('[manage/reschedule POST]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
