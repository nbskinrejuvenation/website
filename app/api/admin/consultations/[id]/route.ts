import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateConsultation } from '@/lib/data/consultations-admin'
import type { ConsultationStatus } from '@/types/database'

const patchSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  internal_notes: z.string().max(5000).nullable().optional(),
})

interface Props {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = patchSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 422 })
  }

  if (!result.data.status && result.data.internal_notes === undefined) {
    return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
  }

  try {
    const { consultation, calendarEventRemoved, cancellationEmail } =
      await updateConsultation(id, {
        status: result.data.status as ConsultationStatus | undefined,
        internal_notes: result.data.internal_notes,
      })
    return NextResponse.json({ consultation, calendarEventRemoved, cancellationEmail })
  } catch (err) {
    console.error('[admin/consultations PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
