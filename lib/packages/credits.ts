import { createAdminClient } from '@/lib/supabase/admin'
import type { ClientPackageCredit, TreatmentPackage } from '@/types/database'

export interface PackageCreditSummary {
  id: string
  label: string
  sessionsRemaining: number
  sessionsTotal: number
}

export async function getActivePackagesForTreatment(
  treatmentId: string,
): Promise<TreatmentPackage[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatment_packages')
    .select('*')
    .eq('treatment_id', treatmentId)
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('price_cents', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as TreatmentPackage[]
}

export async function getPackageById(
  packageId: string,
  treatmentId: string,
): Promise<TreatmentPackage | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('treatment_packages')
    .select('*')
    .eq('id', packageId)
    .eq('treatment_id', treatmentId)
    .eq('active', true)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as TreatmentPackage) ?? null
}

export async function getAvailableCreditsForClient(
  clientId: string,
  treatmentId: string,
): Promise<PackageCreditSummary[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('client_package_credits')
    .select('id, sessions_total, sessions_used, package:treatment_packages (label)')
    .eq('client_id', clientId)
    .eq('treatment_id', treatmentId)

  if (error) throw new Error(error.message)

  const summaries: PackageCreditSummary[] = []
  for (const row of data ?? []) {
    const used = row.sessions_used as number
    const total = row.sessions_total as number
    const remaining = total - used
    if (remaining <= 0) continue
    const pkg = Array.isArray(row.package) ? row.package[0] : row.package
    summaries.push({
      id: row.id as string,
      label: (pkg?.label as string) ?? 'Session package',
      sessionsRemaining: remaining,
      sessionsTotal: total,
    })
  }
  return summaries
}

export async function redeemPackageCredit(
  creditId: string,
  clientId: string,
): Promise<ClientPackageCredit | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: existing, error: fetchError } = await supabase
    .from('client_package_credits')
    .select('*')
    .eq('id', creditId)
    .eq('client_id', clientId)
    .maybeSingle()

  if (fetchError || !existing) return null
  if (existing.sessions_used >= existing.sessions_total) return null

  const { data: updated, error } = await supabase
    .from('client_package_credits')
    .update({
      sessions_used: existing.sessions_used + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', creditId)
    .eq('client_id', clientId)
    .eq('sessions_used', existing.sessions_used)
    .select('*')
    .maybeSingle()

  if (error || !updated) return null
  return updated as ClientPackageCredit
}

export async function createPackageCreditsAfterPurchase(input: {
  clientId: string
  treatmentId: string
  packageId: string
  sessionCount: number
  purchaseAmountCents: number
  stripeCheckoutSessionId?: string | null
  stripePaymentIntentId?: string | null
  /** First session consumed by the booking that triggered purchase */
  sessionsUsedOnPurchase?: number
}): Promise<ClientPackageCredit> {
  const sessionsUsed = input.sessionsUsedOnPurchase ?? 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('client_package_credits')
    .insert({
      client_id: input.clientId,
      treatment_id: input.treatmentId,
      package_id: input.packageId,
      sessions_total: input.sessionCount,
      sessions_used: sessionsUsed,
      purchase_amount_cents: input.purchaseAmountCents,
      stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
      stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
    })
    .select('*')
    .single()

  if (error) throw new Error(`createPackageCredits: ${error.message}`)
  return data as ClientPackageCredit
}
