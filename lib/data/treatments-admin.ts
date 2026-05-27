import { createAdminClient } from '@/lib/supabase/admin'
import type { Treatment } from '@/types/database'

export type TreatmentBookingSettings = Pick<
  Treatment,
  | 'id'
  | 'slug'
  | 'title'
  | 'price_from'
  | 'price_cents'
  | 'duration_minutes'
  | 'bookable_online'
  | 'status'
>

export async function listTreatmentBookingSettings(): Promise<TreatmentBookingSettings[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatments')
    .select('id, slug, title, price_from, price_cents, duration_minutes, bookable_online, status')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`listTreatmentBookingSettings: ${error.message}`)
  return (data ?? []) as TreatmentBookingSettings[]
}

export async function updateTreatmentBookingSettings(
  id: string,
  patch: {
    price_cents: number
    duration_minutes: number
    bookable_online: boolean
  },
): Promise<TreatmentBookingSettings> {
  if (patch.price_cents < 50) {
    throw new Error('Online price must be at least $0.50 (50 cents).')
  }
  if (patch.duration_minutes < 15 || patch.duration_minutes > 240) {
    throw new Error('Duration must be between 15 and 240 minutes.')
  }

  const priceFrom = Math.round(patch.price_cents / 100)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatments')
    .update({
      price_cents: patch.price_cents,
      price_from: priceFrom,
      duration_minutes: patch.duration_minutes,
      bookable_online: patch.bookable_online,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, slug, title, price_from, price_cents, duration_minutes, bookable_online, status')
    .single()

  if (error) throw new Error(`updateTreatmentBookingSettings: ${error.message}`)
  return data as TreatmentBookingSettings
}
