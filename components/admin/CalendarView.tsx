import Link from 'next/link'
import type { AppointmentListItem } from '@/lib/data/appointments-admin'
import {
  addDaysToDateKey,
  formatAdminDayHeading,
  formatAdminTime,
  getSydneyDateKey,
  isOnSydneyDate,
  startOfWeekDateKey,
} from '@/lib/admin/datetime'
import { cn } from '@/lib/utils/cn'

interface Props {
  weekStart: string
  appointments: AppointmentListItem[]
}

export function CalendarView({ weekStart, appointments }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => addDaysToDateKey(weekStart, i))
  const todayKey = getSydneyDateKey()

  const byDay = new Map<string, AppointmentListItem[]>()
  for (const day of days) byDay.set(day, [])
  for (const a of appointments) {
    for (const day of days) {
      if (isOnSydneyDate(a.starts_at, day)) {
        byDay.get(day)!.push(a)
        break
      }
    }
  }

  const prevWeek = addDaysToDateKey(weekStart, -7)
  const nextWeek = addDaysToDateKey(weekStart, 7)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Link href={`/admin/calendar?week=${prevWeek}`} className="btn-outline text-sm">
          ← Previous
        </Link>
        <p className="text-sm text-ink-muted">
          Week of {formatAdminDayHeading(weekStart)}
        </p>
        <Link href={`/admin/calendar?week=${nextWeek}`} className="btn-outline text-sm">
          Next →
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-7">
        {days.map(day => {
          const items = byDay.get(day) ?? []
          return (
            <div
              key={day}
              className={cn(
                'min-h-[120px] rounded-sm bg-white p-3 shadow-card ring-1',
                day === todayKey ? 'ring-brand-400' : 'ring-sand-dark/40',
              )}
            >
              <p
                className={cn(
                  'text-xs font-medium uppercase tracking-wide',
                  day === todayKey ? 'text-brand-600' : 'text-ink-faint',
                )}
              >
                {formatAdminDayHeading(day).split(',')[0]}
              </p>
              <p className="text-[10px] text-ink-muted">
                {day.slice(8)}/{day.slice(5, 7)}
              </p>
              <ul className="mt-2 space-y-2">
                {items.length === 0 ? (
                  <li className="text-[10px] text-ink-faint">—</li>
                ) : (
                  items.map(a => (
                    <li key={`${a.kind}-${a.id}`}>
                      <Link
                        href={`/admin/appointments?selected=${a.kind}-${a.id}`}
                        className="block rounded-sm bg-brand-50 px-2 py-1.5 text-[10px] leading-tight hover:bg-brand-100"
                      >
                        <span className="font-medium text-ink">{formatAdminTime(a.starts_at)}</span>
                        <span className="mt-0.5 block truncate text-ink-muted">
                          {a.client.full_name}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
