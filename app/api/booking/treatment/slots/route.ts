import { NextResponse } from 'next/server'
import { getBookableTreatmentBySlug } from '@/lib/booking/get-bookable-treatment'
import {
  getAvailableSlotsForDuration,
  getBookingCalendarForDuration,
} from '@/lib/booking/availability'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const date = searchParams.get('date')

  if (!slug) {
    return NextResponse.json({ error: 'Treatment slug is required.' }, { status: 400 })
  }

  try {
    const treatment = await getBookableTreatmentBySlug(slug)
    if (!treatment) {
      return NextResponse.json({ error: 'Treatment not found or not bookable online.' }, { status: 404 })
    }

    const duration = treatment.duration_minutes

    if (date) {
      const slots = await getAvailableSlotsForDuration(date, duration)
      return NextResponse.json({
        slug,
        durationMinutes: duration,
        date,
        slots,
      })
    }

    const calendar = await getBookingCalendarForDuration(duration)
    return NextResponse.json({
      slug,
      durationMinutes: duration,
      calendar,
    })
  } catch (err) {
    console.error('[booking/treatment/slots]', err)
    return NextResponse.json(
      { error: 'Could not load available times. Please call us to book.' },
      { status: 500 },
    )
  }
}
