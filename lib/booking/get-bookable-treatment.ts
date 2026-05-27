import { createAdminClient } from '@/lib/supabase/admin'
import type { BookableTreatment } from '@/types/database'

export async function getBookableTreatmentBySlug(
  slug: string,
): Promise<BookableTreatment | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatments')
    .select('id, slug, title, duration_minutes, price_cents, bookable_online, price_from')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('bookable_online', true)
    .maybeSingle()

  if (error) throw new Error(`getBookableTreatmentBySlug: ${error.message}`)
  if (!data?.price_cents) return null
  return data as BookableTreatment
}

export async function getBookableTreatmentById(
  treatmentId: string,
): Promise<BookableTreatment | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatments')
    .select('id, slug, title, duration_minutes, price_cents, bookable_online, price_from')
    .eq('id', treatmentId)
    .eq('bookable_online', true)
    .maybeSingle()

  if (error) throw new Error(`getBookableTreatmentById: ${error.message}`)
  if (!data?.price_cents) return null
  return data as BookableTreatment
}
