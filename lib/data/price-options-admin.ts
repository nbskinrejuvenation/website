import { createAdminClient } from '@/lib/supabase/admin'
import type { TreatmentPriceOption } from '@/types/database'

/** Uncached lookup used when booking: the row must be active and belong to the treatment. */
export async function getActivePriceOption(
  id: string,
  treatmentId: string,
): Promise<TreatmentPriceOption | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatment_price_options')
    .select('*')
    .eq('id', id)
    .eq('treatment_id', treatmentId)
    .eq('active', true)
    .maybeSingle()

  if (error) throw new Error(`getActivePriceOption: ${error.message}`)
  return (data as TreatmentPriceOption | null) ?? null
}

export async function listPriceOptionsAdmin(): Promise<TreatmentPriceOption[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatment_price_options')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`listPriceOptionsAdmin: ${error.message}`)
  return (data ?? []) as TreatmentPriceOption[]
}

export interface PriceOptionInput {
  group_name: string
  label: string
  price_cents: number
  session_count: number
  subtitle: string | null
  sort_order: number
  active: boolean
}

export async function createPriceOptionAdmin(
  input: PriceOptionInput & { treatment_id: string },
): Promise<TreatmentPriceOption> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatment_price_options')
    .insert(input)
    .select('*')
    .single()

  if (error) {
    throw new Error(
      error.code === '23505'
        ? 'This treatment already has a row with that heading and label.'
        : `createPriceOptionAdmin: ${error.message}`,
    )
  }
  return data as TreatmentPriceOption
}

export async function updatePriceOptionAdmin(
  id: string,
  patch: Partial<PriceOptionInput>,
): Promise<TreatmentPriceOption> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatment_price_options')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(
      error.code === '23505'
        ? 'This treatment already has a row with that heading and label.'
        : `updatePriceOptionAdmin: ${error.message}`,
    )
  }
  return data as TreatmentPriceOption
}

export async function deletePriceOptionAdmin(id: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { error } = await supabase.from('treatment_price_options').delete().eq('id', id)
  if (error) throw new Error(`deletePriceOptionAdmin: ${error.message}`)
}
