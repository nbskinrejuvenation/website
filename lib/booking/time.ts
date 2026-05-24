import { CLINIC_TIMEZONE } from '@/lib/booking/constants'

/** YYYY-MM-DD in clinic timezone */
export function formatDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: CLINIC_TIMEZONE })
}

/** Weekday 0=Sunday … 6=Saturday in clinic timezone */
export function getDayOfWeek(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  const weekday = utc.toLocaleDateString('en-US', {
    timeZone: CLINIC_TIMEZONE,
    weekday: 'short',
  })
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }
  return map[weekday] ?? 0
}

/** Build UTC Date for a local clinic date + HH:mm */
export function clinicLocalToUtc(dateKey: string, timeHHmm: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  const [hour, minute] = timeHHmm.split(':').map(Number)

  // Probe offset using noon UTC on that calendar day
  const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CLINIC_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(probe)
  const clinicHourAtProbe = Number(parts.find(p => p.type === 'hour')?.value ?? 12)
  const offsetHours = clinicHourAtProbe - 12

  return new Date(Date.UTC(year, month - 1, day, hour - offsetHours, minute, 0, 0))
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}
