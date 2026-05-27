import { NextResponse } from 'next/server'
import { exportBookingsCsv } from '@/lib/data/admin-export'

export async function GET() {
  try {
    const csv = await exportBookingsCsv()
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="bookings.csv"',
      },
    })
  } catch (err) {
    console.error('[admin/export/bookings]', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
