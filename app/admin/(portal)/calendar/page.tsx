import { CalendarView } from '@/components/admin/CalendarView'
import { listCalendarAppointments } from '@/lib/data/appointments-admin'
import { addDaysToDateKey, getSydneyDateKey, startOfWeekDateKey } from '@/lib/admin/datetime'

interface Props {
  searchParams: Promise<{ week?: string }>
}

export default async function AdminCalendarPage({ searchParams }: Props) {
  const { week } = await searchParams
  const todayKey = getSydneyDateKey()
  const weekStart = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : startOfWeekDateKey(todayKey)
  const weekEnd = addDaysToDateKey(weekStart, 6)

  const appointments = await listCalendarAppointments(weekStart, weekEnd)

  return <CalendarView weekStart={weekStart} appointments={appointments} />
}
