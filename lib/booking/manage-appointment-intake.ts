import { createAdminClient } from '@/lib/supabase/admin'
import type { BookingIntakeKind } from '@/types/database'

export async function resolveBookingIdByToken(
  token: string,
): Promise<{ kind: BookingIntakeKind; id: string } | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const [c, t] = await Promise.all([
    supabase.from('consultation_bookings').select('id').eq('management_token', token).maybeSingle(),
    supabase.from('treatment_bookings').select('id').eq('management_token', token).maybeSingle(),
  ])

  if (c.data && t.data) return null
  if (c.data) return { kind: 'consultation', id: c.data.id }
  if (t.data) return { kind: 'treatment', id: t.data.id }
  return null
}
