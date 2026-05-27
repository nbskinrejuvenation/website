import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateClientAdminNotes } from '@/lib/data/clients-admin'

const patchSchema = z.object({
  notes: z.string().max(10000).nullable(),
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
    const client = await updateClientAdminNotes(id, result.data.notes)
    return NextResponse.json({ client })
  } catch (err) {
    console.error('[admin/clients PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
