import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateContactSubmission } from '@/lib/data/contact-submissions-admin'

const patchSchema = z.object({
  is_read: z.boolean().optional(),
  admin_notes: z.string().max(10000).nullable().optional(),
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

  try {
    const submission = await updateContactSubmission(id, result.data)
    return NextResponse.json({ submission })
  } catch (err) {
    console.error('[admin/contact-submissions PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
