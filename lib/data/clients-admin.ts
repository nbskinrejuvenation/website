import { createAdminClient } from '@/lib/supabase/admin'
import type { Client, ConsultationBooking, TreatmentBooking } from '@/types/database'

export type ClientWithStats = Client & {
  consultation_count: number
  treatment_count: number
  last_visit_at: string | null
}

export type ClientDetail = Client & {
  consultations: ConsultationBooking[]
  treatments: Array<
    TreatmentBooking & { treatment: { id: string; slug: string; title: string } }
  >
}

export async function listClients(search?: string): Promise<ClientWithStats[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  let query = supabase.from('clients').select('*').order('updated_at', { ascending: false })

  if (search?.trim()) {
    const term = search.trim().replace(/%/g, '')
    query = query.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`,
    )
  }

  const { data: clients, error } = await query.limit(200)
  if (error) throw new Error(`listClients: ${error.message}`)

  const rows = (clients ?? []) as Client[]
  if (rows.length === 0) return []

  const ids = rows.map(c => c.id)

  const [consultationsRes, treatmentsRes] = await Promise.all([
    supabase.from('consultation_bookings').select('client_id, starts_at, status').in('client_id', ids),
    supabase.from('treatment_bookings').select('client_id, starts_at, status').in('client_id', ids),
  ])

  if (consultationsRes.error) throw new Error(consultationsRes.error.message)
  if (treatmentsRes.error) throw new Error(treatmentsRes.error.message)

  const consultByClient = new Map<string, Array<{ starts_at: string; status: string }>>()
  for (const row of consultationsRes.data ?? []) {
    const list = consultByClient.get(row.client_id) ?? []
    list.push(row)
    consultByClient.set(row.client_id, list)
  }

  const treatByClient = new Map<string, Array<{ starts_at: string; status: string }>>()
  for (const row of treatmentsRes.data ?? []) {
    const list = treatByClient.get(row.client_id) ?? []
    list.push(row)
    treatByClient.set(row.client_id, list)
  }

  return rows.map(client => {
    const consults = consultByClient.get(client.id) ?? []
    const treats = treatByClient.get(client.id) ?? []
    const visits = [...consults, ...treats]
      .filter(v => v.status === 'confirmed' || v.status === 'completed')
      .map(v => v.starts_at)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    return {
      ...client,
      consultation_count: consults.length,
      treatment_count: treats.length,
      last_visit_at: visits[0] ?? null,
    }
  })
}

export async function getClientDetail(clientId: string): Promise<ClientDetail | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .maybeSingle()

  if (error) throw new Error(`getClientDetail: ${error.message}`)
  if (!client) return null

  const [consultationsRes, treatmentsRes] = await Promise.all([
    supabase
      .from('consultation_bookings')
      .select('*')
      .eq('client_id', clientId)
      .order('starts_at', { ascending: false }),
    supabase
      .from('treatment_bookings')
      .select(`*, treatment:treatments (id, slug, title)`)
      .eq('client_id', clientId)
      .order('starts_at', { ascending: false }),
  ])

  if (consultationsRes.error) throw new Error(consultationsRes.error.message)
  if (treatmentsRes.error) throw new Error(treatmentsRes.error.message)

  return {
    ...(client as Client),
    consultations: (consultationsRes.data ?? []) as ConsultationBooking[],
    treatments: (treatmentsRes.data ?? []) as ClientDetail['treatments'],
  }
}

export async function updateClientAdminNotes(
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

  if (error) throw new Error(`updateClientAdminNotes: ${error.message}`)
  return data as Client
}
