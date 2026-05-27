import { createAdminClient } from '@/lib/supabase/admin'
import { getSydneyDateKey } from '@/lib/admin/datetime'
import { clinicLocalToUtc } from '@/lib/booking/time'

export type ReportPeriod = '7d' | '30d' | 'month'

export interface ReportRange {
  period: ReportPeriod
  label: string
  from: string
  to: string
}

export interface AdminReportSummary {
  range: ReportRange
  consultationCount: number
  treatmentCount: number
  revenueCents: number
  cancelledCount: number
  recentPaid: Array<{
    id: string
    starts_at: string
    amount_cents: number
    client_name: string
    treatment_title: string
  }>
}

function endOfClinicDay(dateKey: string): Date {
  const start = clinicLocalToUtc(dateKey, '23:59')
  return new Date(start.getTime() + 59_999)
}

export function getReportRange(period: ReportPeriod): ReportRange {
  const todayKey = getSydneyDateKey()
  const to = endOfClinicDay(todayKey).toISOString()

  if (period === '7d') {
    const fromDate = new Date(`${todayKey}T12:00:00`)
    fromDate.setDate(fromDate.getDate() - 6)
    const fromKey = getSydneyDateKey(fromDate)
    return {
      period,
      label: 'Last 7 days',
      from: clinicLocalToUtc(fromKey, '00:00').toISOString(),
      to,
    }
  }

  if (period === '30d') {
    const fromDate = new Date(`${todayKey}T12:00:00`)
    fromDate.setDate(fromDate.getDate() - 29)
    const fromKey = getSydneyDateKey(fromDate)
    return {
      period,
      label: 'Last 30 days',
      from: clinicLocalToUtc(fromKey, '00:00').toISOString(),
      to,
    }
  }

  const monthStartKey = `${todayKey.slice(0, 7)}-01`
  return {
    period: 'month',
    label: 'This month',
    from: clinicLocalToUtc(monthStartKey, '00:00').toISOString(),
    to,
  }
}

export async function getAdminReport(period: ReportPeriod): Promise<AdminReportSummary> {
  const range = getReportRange(period)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const [consultationsRes, treatmentsRes, cancelledRes] = await Promise.all([
    supabase
      .from('consultation_bookings')
      .select('id', { count: 'exact', head: true })
      .in('status', ['confirmed', 'completed'])
      .gte('starts_at', range.from)
      .lte('starts_at', range.to),
    supabase
      .from('treatment_bookings')
      .select(
        `
        id,
        starts_at,
        amount_cents,
        client:clients (full_name),
        treatment:treatments (title)
      `,
      )
      .eq('status', 'confirmed')
      .gte('starts_at', range.from)
      .lte('starts_at', range.to)
      .order('starts_at', { ascending: false }),
    supabase
      .from('treatment_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'cancelled')
      .gte('starts_at', range.from)
      .lte('starts_at', range.to),
  ])

  if (consultationsRes.error) throw new Error(consultationsRes.error.message)
  if (treatmentsRes.error) throw new Error(treatmentsRes.error.message)
  if (cancelledRes.error) throw new Error(cancelledRes.error.message)

  const treatments = treatmentsRes.data ?? []
  const revenueCents = treatments.reduce(
    (sum: number, row: { amount_cents: number }) => sum + row.amount_cents,
    0,
  )

  const recentPaid = treatments.slice(0, 15).map(
    (row: {
      id: string
      starts_at: string
      amount_cents: number
      client: { full_name: string } | Array<{ full_name: string }>
      treatment: { title: string } | Array<{ title: string }>
    }) => {
      const client = Array.isArray(row.client) ? row.client[0] : row.client
      const treatment = Array.isArray(row.treatment) ? row.treatment[0] : row.treatment
      return {
        id: row.id,
        starts_at: row.starts_at,
        amount_cents: row.amount_cents,
        client_name: client?.full_name ?? 'Unknown',
        treatment_title: treatment?.title ?? 'Treatment',
      }
    },
  )

  return {
    range,
    consultationCount: consultationsRes.count ?? 0,
    treatmentCount: treatments.length,
    revenueCents,
    cancelledCount: cancelledRes.count ?? 0,
    recentPaid,
  }
}
