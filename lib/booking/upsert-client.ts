import { createAdminClient } from '@/lib/supabase/admin'
import type { Client } from '@/types/database'

export interface UpsertClientInput {
  full_name: string
  email: string
  phone?: string
}

export async function upsertClient(input: UpsertClientInput): Promise<Client> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const email = input.email.trim().toLowerCase()

  const { data: existing } = await supabase
    .from('clients')
    .select('*')
    .ilike('email', email)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('clients')
      .update({
        full_name: input.full_name.trim(),
        phone: input.phone?.trim() || existing.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    if (error) throw new Error(`client update: ${error.message}`)
    return data as Client
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      full_name: input.full_name.trim(),
      email,
      phone: input.phone?.trim() || null,
    })
    .select('*')
    .single()

  if (error) throw new Error(`client insert: ${error.message}`)
  return data as Client
}
