import { NextResponse } from 'next/server'
import { getRescheduleCalendar, type RescheduleKind } from '@/lib/booking/reschedule-appointment'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const kind = searchParams.get('kind') as RescheduleKind | null
  const id = searchParams.get('id')

  if (!kind || (kind !== 'consultation' && kind !== 'treatment') || !id) {
    return NextResponse.json({ error: 'kind and id are required' }, { status: 400 })
  }

  try {
    const data = await getRescheduleCalendar(kind, id, { adminOverride: true })
    return NextResponse.json(data)
  } catch (err) {
    console.error('[admin/reschedule/slots]', err)
    return NextResponse.json({ error: 'Could not load slots' }, { status: 500 })
  }
}
