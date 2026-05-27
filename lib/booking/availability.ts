import { createAdminClient } from '@/lib/supabase/admin'
import { getGoogleBusyIntervals, isGoogleCalendarConfigured } from '@/lib/google/calendar'
import {
  BOOKING_BUFFER_MINUTES,
  BOOKING_HORIZON_DAYS,
  BOOKING_MIN_NOTICE_HOURS,
  PENDING_PAYMENT_HOLD_MINUTES,
  SLOT_STEP_MINUTES,
} from '@/lib/booking/constants'
import {
  addMinutes,
  clinicLocalToUtc,
  formatDateKey,
  getDayOfWeek,
} from '@/lib/booking/time'
import type { AvailabilityRule } from '@/types/database'

export interface BusyInterval {
  start: Date
  end: Date
}

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

function isActivePendingPayment(createdAt: string, holdCutoff: Date): boolean {
  return new Date(createdAt).getTime() >= holdCutoff.getTime()
}

export type BusyExclusion =
  | { kind: 'consultation'; id: string }
  | { kind: 'treatment'; id: string }

async function getConsultationBusyBetween(
  from: Date,
  to: Date,
  exclude?: BusyExclusion,
): Promise<BusyInterval[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  let query = supabase
    .from('consultation_bookings')
    .select('id, starts_at, ends_at')
    .eq('status', 'confirmed')
    .gte('starts_at', from.toISOString())
    .lte('starts_at', to.toISOString())

  if (exclude?.kind === 'consultation') {
    query = query.neq('id', exclude.id)
  }

  const { data, error } = await query

  if (error) throw new Error(`consultation_bookings: ${error.message}`)
  return (data ?? []).map((b: { starts_at: string; ends_at: string }) => ({
    start: new Date(b.starts_at),
    end: new Date(b.ends_at),
  }))
}

async function getTreatmentBusyBetween(
  from: Date,
  to: Date,
  exclude?: BusyExclusion,
): Promise<BusyInterval[]> {
  const holdCutoff = addMinutes(new Date(), -PENDING_PAYMENT_HOLD_MINUTES)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  let query = supabase
    .from('treatment_bookings')
    .select('id, starts_at, ends_at, status, created_at')
    .in('status', ['confirmed', 'pending_payment'])
    .gte('starts_at', from.toISOString())
    .lte('starts_at', to.toISOString())

  if (exclude?.kind === 'treatment') {
    query = query.neq('id', exclude.id)
  }

  const { data, error } = await query

  if (error) throw new Error(`treatment_bookings: ${error.message}`)

  return (data ?? [])
    .filter(
      (b: { status: string; created_at: string }) =>
        b.status === 'confirmed' ||
        isActivePendingPayment(b.created_at, holdCutoff),
    )
    .map((b: { starts_at: string; ends_at: string }) => ({
      start: new Date(b.starts_at),
      end: new Date(b.ends_at),
    }))
}

export async function getBusyIntervals(
  from: Date,
  to: Date,
  exclude?: BusyExclusion,
): Promise<BusyInterval[]> {
  const [consultations, treatments, googleBusy] = await Promise.all([
    getConsultationBusyBetween(from, to, exclude),
    getTreatmentBusyBetween(from, to, exclude),
    isGoogleCalendarConfigured()
      ? getGoogleBusyIntervals(from, to)
      : Promise.resolve([]),
  ])
  return [...consultations, ...treatments, ...googleBusy]
}

export interface SlotQueryOptions {
  /** Skip min-notice check (admin reschedule) */
  adminOverride?: boolean
  /** Exclude this booking from busy conflicts */
  exclude?: BusyExclusion
}

export async function getAvailableSlotsForDuration(
  dateKey: string,
  durationMinutes: number,
  options?: SlotQueryOptions,
): Promise<string[]> {
  const rules = await getAvailabilityRules()
  const dayRule = rules.find(r => r.day_of_week === getDayOfWeek(dateKey))
  if (!dayRule) return []

  const dayStart = clinicLocalToUtc(dateKey, dayRule.start_time.slice(0, 5))
  const dayEnd = clinicLocalToUtc(dateKey, dayRule.end_time.slice(0, 5))

  const busy = await getBusyIntervals(dayStart, dayEnd, options?.exclude)
  const minStart = options?.adminOverride
    ? new Date(0)
    : addMinutes(new Date(), BOOKING_MIN_NOTICE_HOURS * 60)

  const startMin = parseTimeToMinutes(dayRule.start_time.slice(0, 5))
  const endMin = parseTimeToMinutes(dayRule.end_time.slice(0, 5))

  const slots: string[] = []

  for (let t = startMin; t + durationMinutes <= endMin; t += SLOT_STEP_MINUTES) {
    const hhmm = minutesToHHmm(t)
    const slotStart = clinicLocalToUtc(dateKey, hhmm)
    const slotEnd = addMinutes(slotStart, durationMinutes)

    if (slotStart < minStart) continue

    const conflict = busy.some(b =>
      overlaps(slotStart, slotEnd, b.start, b.end, BOOKING_BUFFER_MINUTES),
    )
    if (!conflict) slots.push(hhmm)
  }

  return slots
}

export async function getBookingCalendarForDuration(
  durationMinutes: number,
  options?: SlotQueryOptions,
): Promise<Array<{ date: string; slots: string[] }>> {
  const days: Array<{ date: string; slots: string[] }> = []
  const now = new Date()

  for (let i = 0; i < BOOKING_HORIZON_DAYS; i++) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() + i)
    const dateKey = formatDateKey(d)
    const slots = await getAvailableSlotsForDuration(dateKey, durationMinutes, options)
    if (slots.length > 0) days.push({ date: dateKey, slots })
  }

  return days
}

export function resolveSlotTimes(
  dateKey: string,
  timeHHmm: string,
  durationMinutes: number,
): { startsAt: Date; endsAt: Date } {
  const startsAt = clinicLocalToUtc(dateKey, timeHHmm)
  const endsAt = addMinutes(startsAt, durationMinutes)
  return { startsAt, endsAt }
}

export async function isSlotAvailable(
  dateKey: string,
  timeHHmm: string,
  durationMinutes: number,
  options?: SlotQueryOptions,
): Promise<boolean> {
  const slots = await getAvailableSlotsForDuration(dateKey, durationMinutes, options)
  return slots.includes(timeHHmm)
}
