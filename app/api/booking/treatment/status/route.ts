import { NextResponse } from 'next/server'
import { confirmTreatmentPayment } from '@/lib/booking/confirm-treatment-payment'
import { getManageBookingUrl } from '@/lib/booking/management-url'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe/client'
import { isStripeConfigured } from '@/lib/stripe/config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const bookingId = searchParams.get('booking_id')

  if (bookingId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any
    const { data: booking } = await supabase
      .from('treatment_bookings')
      .select('status, starts_at, management_token')
      .eq('id', bookingId)
      .maybeSingle()

    return NextResponse.json({
      status: booking?.status === 'confirmed' ? 'confirmed' : 'pending',
      startsAt: booking?.starts_at ?? null,
      manageUrl: booking?.management_token
        ? getManageBookingUrl(booking.management_token)
        : null,
    })
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id or booking_id is required' }, { status: 400 })
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Payments not configured' }, { status: 503 })
  }

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const bookingId = session.metadata?.booking_id
    if (!bookingId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    if (session.payment_status === 'paid' && session.status === 'complete') {
      const result = await confirmTreatmentPayment({
        bookingId,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        packageId: session.metadata?.package_id ?? null,
        packageSessionCount: session.metadata?.package_session_count
          ? Number.parseInt(session.metadata.package_session_count, 10)
          : null,
        promoCodeId: session.metadata?.promo_code_id ?? null,
      })

      return NextResponse.json({
        status: result.confirmed ? 'confirmed' : 'pending',
        treatmentTitle: result.treatmentTitle,
        startsAt: result.booking?.starts_at ?? null,
        manageUrl: result.booking?.management_token
          ? getManageBookingUrl(result.booking.management_token)
          : null,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any
    const { data: booking } = await supabase
      .from('treatment_bookings')
      .select('status, starts_at, management_token')
      .eq('id', bookingId)
      .maybeSingle()

    return NextResponse.json({
      status: booking?.status ?? 'pending',
      startsAt: booking?.starts_at ?? null,
      manageUrl: booking?.management_token
        ? getManageBookingUrl(booking.management_token)
        : null,
      paymentStatus: session.payment_status,
    })
  } catch (err) {
    console.error('[booking/treatment/status]', err)
    return NextResponse.json({ error: 'Could not verify payment' }, { status: 500 })
  }
}
