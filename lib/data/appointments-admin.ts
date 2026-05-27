import { createAdminClient } from '@/lib/supabase/admin'
import { listConsultations, type ConsultationWithClient } from '@/lib/data/consultations-admin'
import {
  listTreatmentBookings,
  type TreatmentBookingWithRelations,
} from '@/lib/data/treatment-bookings-admin'
import type { Client, ConsultationStatus, TreatmentBookingStatus } from '@/types/database'

export type AppointmentKind = 'consultation' | 'treatment'

export type AppointmentFilter =
  | 'upcoming'
  | 'all'
  | 'pending_payment'
  | ConsultationStatus
  | TreatmentBookingStatus

export type AppointmentListItem = {
  id: string
  kind: AppointmentKind
  starts_at: string
  ends_at: string
  status: string
  client: Client
  label: string
  subtitle: string
  amount_cents?: number
  consultation?: ConsultationWithClient
  treatment?: TreatmentBookingWithRelations
}

export async function listAppointments(options: {
  filter?: AppointmentFilter
  kind?: AppointmentKind | 'all'
}): Promise<AppointmentListItem[]> {
  const filter = options.filter ?? 'upcoming'
  const kind = options.kind ?? 'all'

  const [consultations, treatments] = await Promise.all([
    kind === 'treatment'
      ? Promise.resolve([] as ConsultationWithClient[])
      : listConsultationsForFilter(filter),
    kind === 'consultation'
      ? Promise.resolve([] as TreatmentBookingWithRelations[])
      : listTreatmentsForFilter(filter),
  ])

  const items: AppointmentListItem[] = [
    ...consultations.map(c => ({
      id: c.id,
      kind: 'consultation' as const,
      starts_at: c.starts_at,
      ends_at: c.ends_at,
      status: c.status,
      client: c.client,
      label: 'Free consultation',
      subtitle: '30 min',
      consultation: c,
    })),
    ...treatments.map(t => ({
      id: t.id,
      kind: 'treatment' as const,
      starts_at: t.starts_at,
      ends_at: t.ends_at,
      status: t.status,
      client: t.client,
      label: t.treatment.title,
      subtitle: `${t.amount_cents / 100} AUD paid`,
      amount_cents: t.amount_cents,
      treatment: t,
    })),
  ]

  return items.sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  )
}

async function listConsultationsForFilter(
  filter: AppointmentFilter,
): Promise<ConsultationWithClient[]> {
  if (filter === 'pending_payment') return []
  if (filter === 'upcoming' || filter === 'all') {
    return listConsultations({
      status: filter === 'all' ? 'all' : 'upcoming',
    })
  }
  if (
    filter === 'confirmed' ||
    filter === 'cancelled' ||
    filter === 'completed' ||
    filter === 'no_show'
  ) {
    return listConsultations({ status: filter })
  }
  return listConsultations({ status: 'upcoming' })
}

async function listTreatmentsForFilter(
  filter: AppointmentFilter,
): Promise<TreatmentBookingWithRelations[]> {
  if (filter === 'pending_payment') {
    return listTreatmentBookings({ status: 'pending_payment' })
  }
  if (filter === 'upcoming' || filter === 'all') {
    return listTreatmentBookings({
      status: filter === 'all' ? 'all' : 'upcoming',
    })
  }
  if (
    filter === 'confirmed' ||
    filter === 'cancelled' ||
    filter === 'completed' ||
    filter === 'no_show'
  ) {
    return listTreatmentBookings({ status: filter })
  }
  return listTreatmentBookings({ status: 'upcoming' })
}

export async function listCalendarAppointments(
  fromDateKey: string,
  toDateKey: string,
): Promise<AppointmentListItem[]> {
  const from = new Date(`${fromDateKey}T00:00:00`)
  const to = new Date(`${toDateKey}T23:59:59.999`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const [consultationsRes, treatmentsRes] = await Promise.all([
    supabase
      .from('consultation_bookings')
      .select(`*, client:clients (*)`)
      .eq('status', 'confirmed')
      .gte('starts_at', from.toISOString())
      .lte('starts_at', to.toISOString())
      .order('starts_at', { ascending: true }),
    supabase
      .from('treatment_bookings')
      .select(`*, client:clients (*), treatment:treatments (id, slug, title)`)
      .eq('status', 'confirmed')
      .gte('starts_at', from.toISOString())
      .lte('starts_at', to.toISOString())
      .order('starts_at', { ascending: true }),
  ])

  if (consultationsRes.error) {
    throw new Error(`calendar consultations: ${consultationsRes.error.message}`)
  }
  if (treatmentsRes.error) {
    throw new Error(`calendar treatments: ${treatmentsRes.error.message}`)
  }

  const consultations = (consultationsRes.data ?? []) as ConsultationWithClient[]
  const treatments = (treatmentsRes.data ?? []) as TreatmentBookingWithRelations[]

  return [
    ...consultations.map(c => ({
      id: c.id,
      kind: 'consultation' as const,
      starts_at: c.starts_at,
      ends_at: c.ends_at,
      status: c.status,
      client: c.client,
      label: 'Free consultation',
      subtitle: '30 min',
      consultation: c,
    })),
    ...treatments.map(t => ({
      id: t.id,
      kind: 'treatment' as const,
      starts_at: t.starts_at,
      ends_at: t.ends_at,
      status: t.status,
      client: t.client,
      label: t.treatment.title,
      subtitle: formatAud(t.amount_cents),
      amount_cents: t.amount_cents,
      treatment: t,
    })),
  ].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
}

function formatAud(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}
