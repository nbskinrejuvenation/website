import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createTreatmentCheckout } from '@/lib/booking/create-treatment-checkout'

const schema = z.object({
  slug: z.string().min(1).max(100),
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  message: z.string().max(2000).optional(),
  source_page: z.string().max(200).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  privacy_consent: z.literal(true, {
    errorMap: () => ({ message: 'Privacy consent is required' }),
  }),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 422 },
    )
  }

  try {
    const { checkoutUrl, bookingId } = await createTreatmentCheckout(result.data)
    return NextResponse.json({ success: true, checkoutUrl, bookingId }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed'
    const status =
      message.includes('no longer available') ||
      message.includes('just booked') ||
      message.includes('not available')
        ? 409
        : message.includes('payments are not available')
          ? 503
          : 500
    console.error('[booking/treatment/checkout]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
