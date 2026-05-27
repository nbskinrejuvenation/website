import { createAdminClient } from '@/lib/supabase/admin'
import type { PromoCode, TreatmentPackage } from '@/types/database'

export async function listPromoCodesAdmin(): Promise<PromoCode[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as PromoCode[]
}

export async function createPromoCodeAdmin(input: {
  code: string
  description?: string
  discount_type: 'percent' | 'fixed_cents'
  discount_value: number
  treatment_id?: string | null
  valid_from?: string | null
  valid_until?: string | null
  max_redemptions?: number | null
}): Promise<PromoCode> {
  const code = input.code.trim().toUpperCase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('promo_codes')
    .insert({
      code,
      description: input.description?.trim() || null,
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      treatment_id: input.treatment_id || null,
      valid_from: input.valid_from || null,
      valid_until: input.valid_until || null,
      max_redemptions: input.max_redemptions ?? null,
      active: true,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as PromoCode
}

export async function updatePromoCodeAdmin(
  id: string,
  patch: Partial<Pick<PromoCode, 'active' | 'description' | 'max_redemptions' | 'valid_until'>>,
): Promise<PromoCode> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('promo_codes')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as PromoCode
}

export async function listTreatmentPackagesAdmin(): Promise<
  Array<TreatmentPackage & { treatment_title: string; treatment_slug: string }>
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatment_packages')
    .select('*, treatment:treatments (title, slug)')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row: TreatmentPackage & { treatment?: { title: string; slug: string } | { title: string; slug: string }[] }) => {
    const t = Array.isArray(row.treatment) ? row.treatment[0] : row.treatment
    const { treatment: _t, ...pkg } = row
    return {
      ...pkg,
      treatment_title: t?.title ?? '',
      treatment_slug: t?.slug ?? '',
    }
  })
}

export async function createTreatmentPackageAdmin(input: {
  treatment_id: string
  label: string
  session_count: number
  price_cents: number
  sort_order?: number
}): Promise<TreatmentPackage> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatment_packages')
    .insert({
      treatment_id: input.treatment_id,
      label: input.label.trim(),
      session_count: input.session_count,
      price_cents: input.price_cents,
      sort_order: input.sort_order ?? 0,
      active: true,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as TreatmentPackage
}

export async function updateTreatmentPackageAdmin(
  id: string,
  patch: Partial<
    Pick<TreatmentPackage, 'label' | 'session_count' | 'price_cents' | 'active' | 'sort_order'>
  >,
): Promise<TreatmentPackage> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatment_packages')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as TreatmentPackage
}
