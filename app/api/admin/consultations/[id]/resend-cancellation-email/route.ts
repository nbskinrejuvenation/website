import { type NextRequest, NextResponse } from 'next/server'
import { sendCancellationEmailForBooking } from '@/lib/data/consultations-admin'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, { params }: Props) {
  const { id } = await params

  try {
    const result = await sendCancellationEmailForBooking(id)
    return NextResponse.json({
      sent: result.sent,
      error: result.error,
      recipient: result.recipient,
    })
  } catch (err) {
    console.error('[admin/resend-cancellation-email]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Resend failed' },
      { status: 500 },
    )
  }
}
