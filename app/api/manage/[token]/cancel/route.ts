import { NextResponse } from 'next/server'
import { cancelBookingByToken, isValidManagementToken } from '@/lib/booking/manage-appointment'

interface Props {
  params: Promise<{ token: string }>
}

export async function POST(_request: Request, { params }: Props) {
  const { token } = await params

  if (!isValidManagementToken(token)) {
    return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
  }

  try {
    const result = await cancelBookingByToken(token)
    if (!result) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cancellation failed'
    const status =
      message.includes('cannot') ||
      message.includes('cancelled') ||
      message.includes('hours before')
        ? 403
        : 500
    console.error('[manage/cancel POST]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
