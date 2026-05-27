import { createAdminClient } from '@/lib/supabase/admin'

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function toCsv(headers: string[], rows: string[][]): string {
  return [headers.join(','), ...rows.map(r => r.map(csvEscape).join(','))].join('\n')
}

export async function exportClientsCsv(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('clients')
    .select('full_name, email, phone, marketing_opt_in, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`exportClientsCsv: ${error.message}`)

  const rows = (data ?? []).map(
    (c: {
      full_name: string
      email: string
      phone: string | null
      marketing_opt_in: boolean
      created_at: string
    }) => [
      c.full_name,
      c.email,
      c.phone ?? '',
      c.marketing_opt_in ? 'yes' : 'no',
      c.created_at,
    ],
  )

  return toCsv(['name', 'email', 'phone', 'marketing_opt_in', 'created_at'], rows)
}

export async function exportBookingsCsv(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const [consultations, treatments] = await Promise.all([
    supabase
      .from('consultation_bookings')
      .select('starts_at, status, client:clients (full_name, email)')
      .order('starts_at', { ascending: false })
      .limit(5000),
    supabase
      .from('treatment_bookings')
      .select(
        'starts_at, status, amount_cents, client:clients (full_name, email), treatment:treatments (title)',
      )
      .order('starts_at', { ascending: false })
      .limit(5000),
  ])

  if (consultations.error) throw new Error(consultations.error.message)
  if (treatments.error) throw new Error(treatments.error.message)

  const rows: string[][] = []

  for (const c of consultations.data ?? []) {
    const client = Array.isArray(c.client) ? c.client[0] : c.client
    rows.push([
      'consultation',
      'Free consultation',
      c.starts_at,
      c.status,
      '',
      client?.full_name ?? '',
      client?.email ?? '',
    ])
  }

  for (const t of treatments.data ?? []) {
    const client = Array.isArray(t.client) ? t.client[0] : t.client
    const treatment = Array.isArray(t.treatment) ? t.treatment[0] : t.treatment
    rows.push([
      'treatment',
      treatment?.title ?? 'Treatment',
      t.starts_at,
      t.status,
      String((t.amount_cents ?? 0) / 100),
      client?.full_name ?? '',
      client?.email ?? '',
    ])
  }

  rows.sort((a, b) => new Date(b[2]).getTime() - new Date(a[2]).getTime())

  return toCsv(
    ['kind', 'service', 'starts_at', 'status', 'amount_aud', 'client_name', 'client_email'],
    rows,
  )
}
