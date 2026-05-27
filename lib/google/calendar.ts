import { addDaysToDateKey, getSydneyDateKey } from '@/lib/admin/datetime'
import { CLINIC_TIMEZONE } from '@/lib/booking/constants'

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      process.env.GOOGLE_CALENDAR_ID,
  )
}

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google token refresh failed: ${text}`)
  }

  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

export interface CreateConsultationEventInput {
  clientName: string
  clientEmail: string
  clientPhone?: string | null
  treatmentInterest?: string | null
  message?: string | null
  startsAt: Date
  endsAt: Date
}

export async function createConsultationCalendarEvent(
  input: CreateConsultationEventInput,
): Promise<string | null> {
  if (!isGoogleCalendarConfigured()) {
    console.warn('[google-calendar] Not configured — skipping event creation')
    return null
  }

  const accessToken = await getAccessToken()
  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!)

  const description = [
    'Free 30-minute skin consultation — Naturally Beautiful',
    '',
    `Client: ${input.clientName}`,
    `Email: ${input.clientEmail}`,
    input.clientPhone ? `Phone: ${input.clientPhone}` : null,
    input.treatmentInterest ? `Interest: ${input.treatmentInterest}` : null,
    input.message ? `\nNotes:\n${input.message}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendUpdates=all`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `Free consultation — ${input.clientName}`,
        description,
        start: {
          dateTime: input.startsAt.toISOString(),
          timeZone: CLINIC_TIMEZONE,
        },
        end: {
          dateTime: input.endsAt.toISOString(),
          timeZone: CLINIC_TIMEZONE,
        },
        attendees: [{ email: input.clientEmail, displayName: input.clientName }],
        reminders: { useDefault: true },
      }),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google Calendar event failed: ${text}`)
  }

  const data = (await res.json()) as { id: string }
  return data.id
}

export interface CreateTreatmentEventInput {
  treatmentTitle: string
  clientName: string
  clientEmail: string
  clientPhone?: string | null
  message?: string | null
  startsAt: Date
  endsAt: Date
  amountCents: number
}

export async function createTreatmentCalendarEvent(
  input: CreateTreatmentEventInput,
): Promise<string | null> {
  if (!isGoogleCalendarConfigured()) {
    console.warn('[google-calendar] Not configured — skipping event creation')
    return null
  }

  const accessToken = await getAccessToken()
  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!)
  const paidAud = (input.amountCents / 100).toFixed(0)

  const description = [
    `Paid treatment booking — ${input.treatmentTitle}`,
    `Amount paid online: $${paidAud} AUD`,
    '',
    `Client: ${input.clientName}`,
    `Email: ${input.clientEmail}`,
    input.clientPhone ? `Phone: ${input.clientPhone}` : null,
    input.message ? `\nNotes:\n${input.message}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendUpdates=all`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `${input.treatmentTitle} — ${input.clientName}`,
        description,
        start: {
          dateTime: input.startsAt.toISOString(),
          timeZone: CLINIC_TIMEZONE,
        },
        end: {
          dateTime: input.endsAt.toISOString(),
          timeZone: CLINIC_TIMEZONE,
        },
        attendees: [{ email: input.clientEmail, displayName: input.clientName }],
        reminders: { useDefault: true },
      }),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google Calendar event failed: ${text}`)
  }

  const data = (await res.json()) as { id: string }
  return data.id
}

export interface UpdateCalendarEventTimesInput {
  eventId: string
  startsAt: Date
  endsAt: Date
}

/** Updates start/end on an existing calendar event and notifies attendees. */
export async function updateCalendarEventTimes(
  input: UpdateCalendarEventTimesInput,
): Promise<void> {
  if (!isGoogleCalendarConfigured()) {
    console.warn('[google-calendar] Not configured — skipping event update')
    return
  }

  const accessToken = await getAccessToken()
  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!)
  const encodedEventId = encodeURIComponent(input.eventId)

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodedEventId}?sendUpdates=all`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start: {
          dateTime: input.startsAt.toISOString(),
          timeZone: CLINIC_TIMEZONE,
        },
        end: {
          dateTime: input.endsAt.toISOString(),
          timeZone: CLINIC_TIMEZONE,
        },
      }),
    },
  )

  if (!res.ok && res.status !== 404) {
    const text = await res.text()
    throw new Error(`Google Calendar update failed: ${text}`)
  }
}

export interface CreateScheduleBlockEventInput {
  title?: string | null
  startsAt: Date
  endsAt: Date
  allDay: boolean
}

/** Creates a blocked-time event on the clinic calendar (no attendees). */
export async function createScheduleBlockCalendarEvent(
  input: CreateScheduleBlockEventInput,
): Promise<string | null> {
  if (!isGoogleCalendarConfigured()) {
    console.warn('[google-calendar] Not configured — skipping block event')
    return null
  }

  const accessToken = await getAccessToken()
  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!)
  const label = input.title?.trim() || 'Blocked — clinic closed'

  const body: Record<string, unknown> = {
    summary: label,
    description: 'Blocked via clinic admin — not available for online booking.',
    reminders: { useDefault: true },
  }

  if (input.allDay) {
    const startDate = getSydneyDateKey(input.startsAt)
    const endDate = addDaysToDateKey(getSydneyDateKey(input.endsAt), 1)
    body.start = { date: startDate }
    body.end = { date: endDate }
  } else {
    body.start = { dateTime: input.startsAt.toISOString(), timeZone: CLINIC_TIMEZONE }
    body.end = { dateTime: input.endsAt.toISOString(), timeZone: CLINIC_TIMEZONE }
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google Calendar block event failed: ${text}`)
  }

  const data = (await res.json()) as { id: string }
  return data.id
}

/** Deletes a calendar event and notifies attendees (when configured). */
export async function deleteConsultationCalendarEvent(eventId: string): Promise<void> {
  if (!isGoogleCalendarConfigured()) {
    console.warn('[google-calendar] Not configured — skipping event deletion')
    return
  }

  const accessToken = await getAccessToken()
  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!)
  const encodedEventId = encodeURIComponent(eventId)

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodedEventId}?sendUpdates=all`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )

  // 404 = already deleted — treat as success
  if (!res.ok && res.status !== 404) {
    const text = await res.text()
    throw new Error(`Google Calendar delete failed: ${text}`)
  }
}

/** Returns busy intervals as UTC Date pairs */
export async function getGoogleBusyIntervals(
  rangeStart: Date,
  rangeEnd: Date,
): Promise<Array<{ start: Date; end: Date }>> {
  if (!isGoogleCalendarConfigured()) return []

  const accessToken = await getAccessToken()
  const calendarId = process.env.GOOGLE_CALENDAR_ID!

  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin: rangeStart.toISOString(),
      timeMax: rangeEnd.toISOString(),
      timeZone: CLINIC_TIMEZONE,
      items: [{ id: calendarId }],
    }),
  })

  if (!res.ok) return []

  const data = (await res.json()) as {
    calendars: Record<string, { busy: Array<{ start: string; end: string }> }>
  }

  const busy = data.calendars[calendarId]?.busy ?? []
  return busy.map(b => ({ start: new Date(b.start), end: new Date(b.end) }))
}
