import Link from 'next/link'
import { CalendarView } from '@/components/admin/CalendarView'
import { listCalendarAppointments } from '@/lib/data/appointments-admin'
import { listScheduleBlocksBetween } from '@/lib/data/schedule-blocks-admin'
import { addDaysToDateKey, getSydneyDateKey, startOfWeekDateKey } from '@/lib/admin/datetime'
import { clinicLocalToUtc } from '@/lib/booking/time'

interface Props {
  searchParams: Promise<{ week?: string }>
}

export default async function AdminCalendarPage({ searchParams }: Props) {
  const { week } = await searchParams
  const todayKey = getSydneyDateKey()
  const weekStart = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : startOfWeekDateKey(todayKey)
  const weekEnd = addDaysToDateKey(weekStart, 6)

  const from = clinicLocalToUtc(weekStart, '00:00')
  const to = clinicLocalToUtc(weekEnd, '23:59')

  const [appointments, blocks] = await Promise.all([
    listCalendarAppointments(weekStart, weekEnd),
    listScheduleBlocksBetween(from, new Date(to.getTime() + 59_999)),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">Confirmed appointments this week</p>
        <Link href="/admin/blocks" className="btn-outline text-sm">
          Block time on agenda
        </Link>
      </div>
      <CalendarView weekStart={weekStart} appointments={appointments} blocks={blocks} />
    </div>
  )
}
