import { NextResponse } from 'next/server'
import { refundTreatmentBooking } from '@/lib/data/treatment-bookings-admin'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params
  try {
    const result = await refundTreatmentBooking(id)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Refund failed'
    console.error('[admin/treatment-bookings refund]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
