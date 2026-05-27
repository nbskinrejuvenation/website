import { addDaysToDateKey } from '@/lib/admin/datetime'
import { clinicLocalToUtc } from '@/lib/booking/time'

export function buildScheduleBlockTimes(input: {
  date: string
  end_date?: string | null
  all_day: boolean
  start_time?: string
  end_time?: string
}): { startsAt: Date; endsAt: Date } {
  const endDateKey = input.end_date?.trim() || input.date

  if (input.all_day) {
    const startsAt = clinicLocalToUtc(input.date, '00:00')
    const endDay = clinicLocalToUtc(endDateKey, '23:59')
    return { startsAt, endsAt: new Date(endDay.getTime() + 59_999) }
  }

  if (!input.start_time || !input.end_time) {
    throw new Error('Start and end time are required.')
  }

  const startsAt = clinicLocalToUtc(input.date, input.start_time)
  let endsAt = clinicLocalToUtc(endDateKey, input.end_time)

  if (endsAt <= startsAt) {
    if (endDateKey === input.date) {
      throw new Error('End time must be after start time.')
    }
    endsAt = clinicLocalToUtc(endDateKey, input.end_time)
  }

  if (endsAt <= startsAt) {
    throw new Error('End must be after start.')
  }

  return { startsAt, endsAt }
}

/** Iterate date keys from start through end inclusive */
export function dateKeysBetween(startKey: string, endKey: string): string[] {
  const keys: string[] = []
  let current = startKey
  while (current <= endKey) {
    keys.push(current)
    if (current === endKey) break
    current = addDaysToDateKey(current, 1)
  }
  return keys
}
