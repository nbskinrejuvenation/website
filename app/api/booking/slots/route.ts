import { NextResponse } from 'next/server'
import { getAvailableSlotsForDate, getBookingCalendar } from '@/lib/booking/slots'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  try {
    if (date) {
      const slots = await getAvailableSlotsForDate(date)
      return NextResponse.json({ date, slots })
    }

    const calendar = await getBookingCalendar()
    return NextResponse.json({ calendar })
  } catch (err) {
    console.error('[booking/slots]', err)
    return NextResponse.json(
      { error: 'Could not load available times. Please call us to book.' },
      { status: 500 },
    )
  }
}
