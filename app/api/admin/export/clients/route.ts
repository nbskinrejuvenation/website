import { NextResponse } from 'next/server'
import { exportClientsCsv } from '@/lib/data/admin-export'

export async function GET() {
  try {
    const csv = await exportClientsCsv()
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="clients.csv"',
      },
    })
  } catch (err) {
    console.error('[admin/export/clients]', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
