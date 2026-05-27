'use client'

import { useCallback, useEffect, useState } from 'react'
import { formatAdminWhen } from '@/lib/admin/datetime'
import type { RescheduleKind } from '@/lib/booking/reschedule-appointment'
import { cn } from '@/lib/utils/cn'

type CalendarDay = { date: string; slots: string[] }

interface Props {
  kind: RescheduleKind
  bookingId: string
  currentStartsAt: string
  onRescheduled: (startsAt: string) => void
}

export function ReschedulePanel({ kind, bookingId, currentStartsAt, onRescheduled }: Props) {
  const [open, setOpen] = useState(false)
  const [calendar, setCalendar] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSlots = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/reschedule/slots?kind=${kind}&id=${encodeURIComponent(bookingId)}`,
      )
      const data = (await res.json()) as { calendar?: CalendarDay[]; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Could not load times')
      setCalendar(data.calendar ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load times')
      setCalendar([])
    } finally {
      setLoading(false)
    }
  }, [kind, bookingId])

  useEffect(() => {
    if (open) void loadSlots()
  }, [open, loadSlots])

  const formatDayLabel = (dateKey: string) => {
    const d = new Date(`${dateKey}T12:00:00`)
    return d.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'Australia/Sydney',
    })
  }

  const slots = calendar.find(d => d.date === selectedDate)?.slots ?? []

  const submit = async () => {
    if (!selectedDate || !selectedTime) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          id: bookingId,
          date: selectedDate,
          time: selectedTime,
        }),
      })
      const json = (await res.json()) as { error?: string; startsAt?: string; emailSent?: boolean }
      if (!res.ok) throw new Error(json.error ?? 'Reschedule failed')
      if (json.startsAt) onRescheduled(json.startsAt)
      setOpen(false)
      setSelectedDate(null)
      setSelectedTime(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reschedule failed')
      void loadSlots()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-sm border border-sand-dark/60 bg-cream-dark/30 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">Reschedule</p>
          <p className="mt-1 text-sm text-ink-muted">Current: {formatAdminWhen(currentStartsAt)}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="btn-outline text-sm"
        >
          {open ? 'Close' : 'Change time'}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-sand-dark/40 pt-4">
          {loading ? (
            <p className="text-sm text-ink-muted">Loading available times…</p>
          ) : calendar.length === 0 ? (
            <p className="text-sm text-ink-muted">No slots available in the booking window.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {calendar.map(day => (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(day.date)
                      setSelectedTime(null)
                    }}
                    className={cn(
                      'rounded-sm border px-2 py-1 text-xs',
                      selectedDate === day.date
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-sand-dark text-ink-muted',
                    )}
                  >
                    {formatDayLabel(day.date)}
                  </button>
                ))}
              </div>
              {selectedDate && (
                <div className="flex flex-wrap gap-2">
                  {slots.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        'rounded-sm border px-3 py-1.5 text-sm',
                        selectedTime === time
                          ? 'border-brand-500 bg-brand-500 text-cream'
                          : 'border-sand-dark',
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="button"
            disabled={!selectedDate || !selectedTime || submitting}
            onClick={submit}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Confirm new time'}
          </button>
          <p className="text-xs text-ink-faint">Client receives a reschedule email; calendar updates if connected.</p>
        </div>
      )}
    </div>
  )
}
