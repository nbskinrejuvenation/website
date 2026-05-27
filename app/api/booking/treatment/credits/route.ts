import { NextResponse } from 'next/server'
import { getBookableTreatmentBySlug } from '@/lib/booking/get-bookable-treatment'
import { getAvailableCreditsForClient } from '@/lib/packages/credits'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')?.trim()
  const email = searchParams.get('email')?.trim().toLowerCase()

  if (!slug || !email) {
    return NextResponse.json({ error: 'slug and email are required' }, { status: 400 })
  }

  const treatment = await getBookableTreatmentBySlug(slug)
  if (!treatment) {
    return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (!client) {
    return NextResponse.json({ credits: [] })
  }

  const credits = await getAvailableCreditsForClient(client.id, treatment.id)
  return NextResponse.json({ credits })
}
