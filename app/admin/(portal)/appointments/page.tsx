import { Suspense } from 'react'
import { AppointmentsInbox } from '@/components/admin/AppointmentsInbox'
import {
  listAppointments,
  type AppointmentFilter,
  type AppointmentKind,
} from '@/lib/data/appointments-admin'

interface Props {
  searchParams: Promise<{ filter?: string; kind?: string }>
}

function parseFilter(param?: string): AppointmentFilter {
  if (param === 'all') return 'all'
  if (param === 'pending_payment') return 'pending_payment'
  if (param === 'cancelled') return 'cancelled'
  if (param === 'completed') return 'completed'
  if (param === 'confirmed') return 'confirmed'
  if (param === 'no_show') return 'no_show'
  return 'upcoming'
}

function parseKind(param?: string): AppointmentKind | 'all' {
  if (param === 'consultation') return 'consultation'
  if (param === 'treatment') return 'treatment'
  return 'all'
}

export default async function AdminAppointmentsPage({ searchParams }: Props) {
  const { filter: filterParam, kind: kindParam } = await searchParams
  const filter = parseFilter(filterParam)
  const kind = parseKind(kindParam)
  const appointments = await listAppointments({ filter, kind })

  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
      <AppointmentsInbox initialAppointments={appointments} filter={filter} kind={kind} />
    </Suspense>
  )
}
