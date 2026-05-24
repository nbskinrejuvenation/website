import { createAdminClient } from '@/lib/supabase/admin'
import type { Client, ConsultationBooking, ConsultationStatus } from '@/types/database'

export type ConsultationWithClient = ConsultationBooking & {
  client: Client
}

export async function listConsultations(filters?: {
  status?: ConsultationStatus | 'upcoming' | 'all'
}): Promise<ConsultationWithClient[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  let query = supabase
    .from('consultation_bookings')
    .select(
      `
      *,
      client:clients (*)
    `,
    )
    .order('starts_at', { ascending: true })

  const status = filters?.status ?? 'upcoming'
  const now = new Date().toISOString()

  if (status === 'upcoming') {
    query = query.eq('status', 'confirmed').gte('starts_at', now)
  } else if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw new Error(`listConsultations: ${error.message}`)

  return (data ?? []) as ConsultationWithClient[]
}

export async function updateConsultation(
  id: string,
  patch: {
    status?: ConsultationStatus
    internal_notes?: string | null
  },
): Promise<ConsultationWithClient> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('consultation_bookings')
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`*, client:clients (*)`)
    .single()

  if (error) throw new Error(`updateConsultation: ${error.message}`)
  return data as ConsultationWithClient
}

export async function updateClientNotes(
  clientId: string,
  notes: string | null,
): Promise<Client> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('clients')
    .update({ notes: notes?.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', clientId)
    .select('*')
    .single()

  if (error) throw new Error(`updateClientNotes: ${error.message}`)
  return data as Client
}
