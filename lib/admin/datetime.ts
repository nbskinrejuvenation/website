export const CLINIC_TZ = 'Australia/Sydney'

export function getSydneyDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CLINIC_TZ }).format(date)
}

export function formatAdminWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: CLINIC_TZ,
  })
}

export function formatAdminWhenLong(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: CLINIC_TZ,
  })
}

export function formatAdminTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: CLINIC_TZ,
  })
}

export function formatAdminDayHeading(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`)
  return d.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: CLINIC_TZ,
  })
}

/** True if `iso` falls on the given Sydney calendar date (YYYY-MM-DD). */
export function isOnSydneyDate(iso: string, dateKey: string): boolean {
  return getSydneyDateKey(new Date(iso)) === dateKey
}

export function startOfWeekDateKey(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  return getSydneyDateKey(d)
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T12:00:00`)
  d.setDate(d.getDate() + days)
  return getSydneyDateKey(d)
}
