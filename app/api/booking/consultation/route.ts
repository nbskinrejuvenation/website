import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { bookConsultation } from '@/lib/booking/create-consultation'

const schema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  treatment_interest: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
  source_page: z.string().max(200).optional(),
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
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 422 },
    )
  }

  try {
    const booking = await bookConsultation(result.data)
    return NextResponse.json(
      {
        success: true,
        bookingId: booking.booking.id,
        startsAt: booking.booking.starts_at,
        calendarSynced: booking.calendarSynced,
        confirmationEmailSent: booking.emailsSent.client,
      },
      { status: 201 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Booking failed'
    const status = message.includes('no longer available') || message.includes('just booked')
      ? 409
      : 500
    console.error('[booking/consultation]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
