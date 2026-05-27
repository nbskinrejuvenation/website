import Link from 'next/link'
import type { AppointmentListItem } from '@/lib/data/appointments-admin'
import type { ScheduleBlock } from '@/types/database'
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
  blocks: ScheduleBlock[]
}

export function CalendarView({ weekStart, appointments, blocks }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => addDaysToDateKey(weekStart, i))
  const todayKey = getSydneyDateKey()

  const byDay = new Map<string, AppointmentListItem[]>()
  for (const day of days) byDay.set(day, [])
  const blocksByDay = new Map<string, ScheduleBlock[]>()
  for (const day of days) blocksByDay.set(day, [])

  for (const a of appointments) {
    for (const day of days) {
      if (isOnSydneyDate(a.starts_at, day)) {
        byDay.get(day)!.push(a)
        break
      }
    }
  }

  for (const block of blocks) {
    const blockStartKey = getSydneyDateKey(new Date(block.starts_at))
    const blockEndKey = getSydneyDateKey(new Date(block.ends_at))
    for (const day of days) {
      if (day >= blockStartKey && day <= blockEndKey) {
        blocksByDay.get(day)!.push(block)
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
          const dayBlocks = blocksByDay.get(day) ?? []
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
                {dayBlocks.map(block => {
                  const blockStartKey = getSydneyDateKey(new Date(block.starts_at))
                  const blockEndKey = getSydneyDateKey(new Date(block.ends_at))
                  const multiDay = blockStartKey !== blockEndKey
                  const allDay =
                    new Date(block.ends_at).getTime() - new Date(block.starts_at).getTime() >=
                    23 * 60 * 60 * 1000
                  return (
                    <li key={block.id}>
                      <div
                        className="rounded-sm border border-dashed border-ink/25 bg-ink/5 px-2 py-1.5 text-[10px] leading-tight text-ink-muted"
                        title="Blocked from online booking"
                      >
                        <span className="font-medium text-ink">{block.title || 'Blocked'}</span>
                        <span className="mt-0.5 block">
                          {multiDay && !isOnSydneyDate(block.starts_at, day)
                            ? 'Continues'
                            : multiDay && !isOnSydneyDate(block.ends_at, day)
                              ? 'Continues'
                              : allDay
                                ? 'All day'
                                : `${formatAdminTime(block.starts_at)} – ${formatAdminTime(block.ends_at)}`}
                        </span>
                      </div>
                    </li>
                  )
                })}
                {items.length === 0 && dayBlocks.length === 0 ? (
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
