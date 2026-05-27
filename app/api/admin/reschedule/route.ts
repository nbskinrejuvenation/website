import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rescheduleAppointment } from '@/lib/booking/reschedule-appointment'

const schema = z.object({
  kind: z.enum(['consultation', 'treatment']),
  id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 422 })
  }

  try {
    const outcome = await rescheduleAppointment(result.data, { adminOverride: true })
    return NextResponse.json({ success: true, ...outcome })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Reschedule failed'
    const status = message.includes('not available') || message.includes('just booked') ? 409 : 500
    console.error('[admin/reschedule POST]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
