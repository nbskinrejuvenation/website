import { createAdminClient } from '@/lib/supabase/admin'
import { addDaysToDateKey, getSydneyDateKey, isOnSydneyDate } from '@/lib/admin/datetime'
import { getUnreadContactCount } from '@/lib/data/contact-submissions-admin'
import type { ConsultationWithClient } from '@/lib/data/consultations-admin'
import type { TreatmentBookingWithRelations } from '@/lib/data/treatment-bookings-admin'

export interface AdminDashboardStats {
  todayAppointments: number
  weekAppointments: number
  pendingPayments: number
  weekRevenueCents: number
  unreadMessages: number
  monthCompleted: number
  monthNoShows: number
  nextAppointment: {
    id: string
    kind: 'consultation' | 'treatment'
    starts_at: string
    clientName: string
    label: string
  } | null
  todayItems: Array<{
    id: string
    kind: 'consultation' | 'treatment'
    starts_at: string
    clientName: string
    label: string
    status: string
  }>
}

function isActiveUpcoming(status: string, startsAt: string): boolean {
  return status === 'confirmed' && new Date(startsAt) >= new Date()
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const now = new Date()
  const todayKey = getSydneyDateKey(now)
  const weekEndKey = addDaysToDateKey(todayKey, 7)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const [consultationsRes, treatmentsRes, pendingRes, unreadMessages] = await Promise.all([
    supabase
      .from('consultation_bookings')
      .select(`*, client:clients (*)`)
      .eq('status', 'confirmed')
      .gte('starts_at', now.toISOString())
      .order('starts_at', { ascending: true })
      .limit(50),
    supabase
      .from('treatment_bookings')
      .select(`*, client:clients (*), treatment:treatments (id, slug, title)`)
      .in('status', ['confirmed', 'pending_payment'])
      .gte('starts_at', now.toISOString())
      .order('starts_at', { ascending: true })
      .limit(50),
    supabase
      .from('treatment_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_payment'),
    getUnreadContactCount().catch(() => 0),
  ])

  if (consultationsRes.error) {
    throw new Error(`dashboard consultations: ${consultationsRes.error.message}`)
  }
  if (treatmentsRes.error) {
    throw new Error(`dashboard treatments: ${treatmentsRes.error.message}`)
  }

  const consultations = (consultationsRes.data ?? []) as ConsultationWithClient[]
  const treatments = (treatmentsRes.data ?? []) as TreatmentBookingWithRelations[]

  type Item = AdminDashboardStats['todayItems'][number] & { sort: number }

  const items: Item[] = [
    ...consultations.map(c => ({
      id: c.id,
      kind: 'consultation' as const,
      starts_at: c.starts_at,
      clientName: c.client.full_name,
      label: 'Free consultation',
      status: c.status,
      sort: new Date(c.starts_at).getTime(),
    })),
    ...treatments.map(t => ({
      id: t.id,
      kind: 'treatment' as const,
      starts_at: t.starts_at,
      clientName: t.client.full_name,
      label: t.treatment.title,
      status: t.status,
      sort: new Date(t.starts_at).getTime(),
    })),
  ].sort((a, b) => a.sort - b.sort)

  const todayItems = items
    .filter(i => isOnSydneyDate(i.starts_at, todayKey) && i.status === 'confirmed')
    .map(({ sort: _s, ...rest }) => rest)

  const weekItems = items.filter(i => {
    const key = getSydneyDateKey(new Date(i.starts_at))
    return key >= todayKey && key <= weekEndKey && i.status === 'confirmed'
  })

  const weekStart = new Date(`${todayKey}T00:00:00`)
  const weekEnd = new Date(`${weekEndKey}T23:59:59`)
  const monthStartKey = addDaysToDateKey(todayKey, -29)
  const monthStart = new Date(`${monthStartKey}T00:00:00`)

  const [completedConsults, completedTreats, noShowConsults, noShowTreats] = await Promise.all([
    supabase
      .from('consultation_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('starts_at', monthStart.toISOString()),
    supabase
      .from('treatment_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('starts_at', monthStart.toISOString()),
    supabase
      .from('consultation_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'no_show')
      .gte('starts_at', monthStart.toISOString()),
    supabase
      .from('treatment_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'no_show')
      .gte('starts_at', monthStart.toISOString()),
  ])

  const { data: paidWeek } = await supabase
    .from('treatment_bookings')
    .select('amount_cents')
    .eq('status', 'confirmed')
    .gte('starts_at', weekStart.toISOString())
    .lte('starts_at', weekEnd.toISOString())

  const weekRevenueCents = (paidWeek ?? []).reduce(
    (sum: number, row: { amount_cents: number }) => sum + row.amount_cents,
    0,
  )

  const next = items.find(i => isActiveUpcoming(i.status, i.starts_at))

  return {
    todayAppointments: todayItems.length,
    weekAppointments: weekItems.length,
    pendingPayments: pendingRes.count ?? 0,
    weekRevenueCents,
    unreadMessages,
    monthCompleted: (completedConsults.count ?? 0) + (completedTreats.count ?? 0),
    monthNoShows: (noShowConsults.count ?? 0) + (noShowTreats.count ?? 0),
    nextAppointment: next
      ? {
          id: next.id,
          kind: next.kind,
          starts_at: next.starts_at,
          clientName: next.clientName,
          label: next.label,
        }
      : null,
    todayItems,
  }
}
