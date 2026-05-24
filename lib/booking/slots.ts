import { createAdminClient } from '@/lib/supabase/admin'
import { getGoogleBusyIntervals, isGoogleCalendarConfigured } from '@/lib/google/calendar'
import {
  BOOKING_BUFFER_MINUTES,
  BOOKING_HORIZON_DAYS,
  BOOKING_MIN_NOTICE_HOURS,
  CONSULTATION_DURATION_MINUTES,
} from '@/lib/booking/constants'
import {
  addMinutes,
  clinicLocalToUtc,
  formatDateKey,
  getDayOfWeek,
} from '@/lib/booking/time'
import type { AvailabilityRule } from '@/types/database'

function overlaps(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
  bufferMinutes: number,
): boolean {
  const buf = bufferMinutes * 60_000
  return aStart.getTime() < bEnd.getTime() + buf && aEnd.getTime() + buf > bStart.getTime()
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToHHmm(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

async function getAvailabilityRules(): Promise<AvailabilityRule[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('availability_rules')
    .select('*')
    .eq('is_active', true)

  if (error) throw new Error(`availability_rules: ${error.message}`)
  return (data ?? []) as AvailabilityRule[]
}

async function getConfirmedBookingsBetween(from: Date, to: Date) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('consultation_bookings')
    .select('starts_at, ends_at')
    .eq('status', 'confirmed')
    .gte('starts_at', from.toISOString())
    .lte('starts_at', to.toISOString())

  if (error) throw new Error(`consultation_bookings: ${error.message}`)
  return (data ?? []).map((b: { starts_at: string; ends_at: string }) => ({
    start: new Date(b.starts_at),
    end: new Date(b.ends_at),
  }))
}

export async function getAvailableSlotsForDate(dateKey: string): Promise<string[]> {
  const rules = await getAvailabilityRules()
  const dayRule = rules.find(r => r.day_of_week === getDayOfWeek(dateKey))
  if (!dayRule) return []

  const dayStart = clinicLocalToUtc(dateKey, dayRule.start_time.slice(0, 5))
  const dayEnd = clinicLocalToUtc(dateKey, dayRule.end_time.slice(0, 5))

  const [dbBookings, googleBusy] = await Promise.all([
    getConfirmedBookingsBetween(dayStart, dayEnd),
    isGoogleCalendarConfigured()
      ? getGoogleBusyIntervals(dayStart, dayEnd)
      : Promise.resolve([]),
  ])

  const busy = [...dbBookings, ...googleBusy]
  const minStart = addMinutes(new Date(), BOOKING_MIN_NOTICE_HOURS * 60)

  const startMin = parseTimeToMinutes(dayRule.start_time.slice(0, 5))
  const endMin = parseTimeToMinutes(dayRule.end_time.slice(0, 5))
  const step = 30

  const slots: string[] = []

  for (let t = startMin; t + CONSULTATION_DURATION_MINUTES <= endMin; t += step) {
    const hhmm = minutesToHHmm(t)
    const slotStart = clinicLocalToUtc(dateKey, hhmm)
    const slotEnd = addMinutes(slotStart, CONSULTATION_DURATION_MINUTES)

    if (slotStart < minStart) continue

    const conflict = busy.some(b =>
      overlaps(slotStart, slotEnd, b.start, b.end, BOOKING_BUFFER_MINUTES),
    )
    if (!conflict) slots.push(hhmm)
  }

  return slots
}

export async function getBookingCalendar(): Promise<
  Array<{ date: string; slots: string[] }>
> {
  const days: Array<{ date: string; slots: string[] }> = []
  const now = new Date()

  for (let i = 0; i < BOOKING_HORIZON_DAYS; i++) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() + i)
    const dateKey = formatDateKey(d)
    const slots = await getAvailableSlotsForDate(dateKey)
    if (slots.length > 0) days.push({ date: dateKey, slots })
  }

  return days
}

export function resolveSlotTimes(
  dateKey: string,
  timeHHmm: string,
): { startsAt: Date; endsAt: Date } {
  const startsAt = clinicLocalToUtc(dateKey, timeHHmm)
  const endsAt = addMinutes(startsAt, CONSULTATION_DURATION_MINUTES)
  return { startsAt, endsAt }
}
