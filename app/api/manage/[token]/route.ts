import { NextResponse } from 'next/server'
import { getManageBookingByToken, isValidManagementToken } from '@/lib/booking/manage-appointment'

interface Props {
  params: Promise<{ token: string }>
}

export async function GET(_request: Request, { params }: Props) {
  const { token } = await params

  if (!isValidManagementToken(token)) {
    return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
  }

  try {
    const booking = await getManageBookingByToken(token)
    if (!booking) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    return NextResponse.json({ booking })
  } catch (err) {
    console.error('[manage GET]', err)
    return NextResponse.json({ error: 'Could not load appointment' }, { status: 500 })
  }
}
