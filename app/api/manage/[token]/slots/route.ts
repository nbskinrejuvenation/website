import { NextResponse } from 'next/server'
import {
  getManageRescheduleCalendar,
  isValidManagementToken,
} from '@/lib/booking/manage-appointment'

interface Props {
  params: Promise<{ token: string }>
}

export async function GET(_request: Request, { params }: Props) {
  const { token } = await params

  if (!isValidManagementToken(token)) {
    return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
  }

  try {
    const data = await getManageRescheduleCalendar(token)
    if (!data) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load times'
    const status =
      message.includes('cannot') ||
      message.includes('cancelled') ||
      message.includes('hours before')
        ? 403
        : 500
    console.error('[manage/slots GET]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
