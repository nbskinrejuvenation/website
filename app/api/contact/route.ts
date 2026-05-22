import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHash } from 'crypto'

const contactSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  treatment_interest: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
  source_page: z.string().max(200).optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = contactSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 422 },
    )
  }

  // Hash IP for spam analysis — never store plaintext
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  const ip_hash = createHash('sha256').update(ip).digest('hex').slice(0, 16)

  // contact_submissions table must exist in Supabase before this route is live.
  // Create it with: id uuid, full_name text, email text, phone text, treatment_interest text,
  // message text, source_page text, ip_hash text, user_agent text, created_at timestamptz.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { error } = await supabase.from('contact_submissions').insert({
    ...result.data,
    ip_hash,
    user_agent: request.headers.get('user-agent') ?? null,
  })

  if (error) {
    console.error('[contact] Insert error:', error)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
