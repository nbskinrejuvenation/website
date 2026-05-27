'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { formatAdminWhen } from '@/lib/admin/datetime'
import { formatAudFromCents } from '@/lib/stripe/config'
import type { ManageBookingView } from '@/lib/booking/manage-appointment'
import { BookingIntakeForm } from '@/components/booking/BookingIntakeForm'
import { cn } from '@/lib/utils/cn'

type CalendarDay = { date: string; slots: string[] }

interface Props {
  token: string
  initialBooking: ManageBookingView
  clinicPhone?: string
}

export function ManageAppointment({ token, initialBooking, clinicPhone }: Props) {
  const [booking, setBooking] = useState(initialBooking)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [calendar, setCalendar] = useState<CalendarDay[]>([])
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const formatDayLabel = (dateKey: string) => {
    const d = new Date(`${dateKey}T12:00:00`)
    return d.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'Australia/Sydney',
    })
  }

  const loadSlots = useCallback(async () => {
    setLoadingCalendar(true)
    setError(null)
    try {
      const res = await fetch(`/api/manage/${token}/slots`)
      const data = (await res.json()) as { calendar?: CalendarDay[]; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Could not load times')
      setCalendar(data.calendar ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load times')
      setCalendar([])
    } finally {
      setLoadingCalendar(false)
    }
  }, [token])

  useEffect(() => {
    if (rescheduleOpen) void loadSlots()
  }, [rescheduleOpen, loadSlots])

  const slots = calendar.find(d => d.date === selectedDate)?.slots ?? []

  const reschedule = async () => {
    if (!selectedDate || !selectedTime) return
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/manage/${token}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, time: selectedTime }),
      })
      const json = (await res.json()) as { error?: string; startsAt?: string; emailSent?: boolean }
      if (!res.ok) throw new Error(json.error ?? 'Reschedule failed')
      if (json.startsAt) {
        setBooking(prev => ({ ...prev, startsAt: json.startsAt! }))
      }
      setRescheduleOpen(false)
      setSelectedDate(null)
      setSelectedTime(null)
      setSuccess(
        json.emailSent
          ? 'Your appointment has been rescheduled. We sent a confirmation to your email.'
          : 'Your appointment has been rescheduled.',
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reschedule failed')
      void loadSlots()
    } finally {
      setSubmitting(false)
    }
  }

  const cancel = async () => {
    setCancelling(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/manage/${token}/cancel`, { method: 'POST' })
      const json = (await res.json()) as {
        error?: string
        status?: string
        refundIssued?: boolean | null
        cancellationEmailSent?: boolean
      }
      if (!res.ok) throw new Error(json.error ?? 'Cancellation failed')
      setBooking(prev => ({ ...prev, status: 'cancelled', canModify: false, modifyBlockedReason: null }))
      setConfirmCancel(false)
      setRescheduleOpen(false)
      const refundNote =
        json.refundIssued === true
          ? ' Your payment will be refunded to your card.'
          : json.refundIssued === false
            ? ' Contact us if you have questions about your payment.'
            : ''
      setSuccess(
        (json.cancellationEmailSent
          ? 'Your appointment has been cancelled. We sent a confirmation to your email.'
          : 'Your appointment has been cancelled.') + refundNote,
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancellation failed')
    } finally {
      setCancelling(false)
    }
  }

  const isCancelled = booking.status === 'cancelled'

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40">
        <p className="eyebrow mb-2">Your appointment</p>
        <h1 className="font-display text-2xl font-light text-ink">{booking.label}</h1>
        <p className="mt-4 rounded-sm bg-brand-50 px-4 py-3 text-center text-lg text-ink">
          {formatAdminWhen(booking.startsAt)}
        </p>
        {booking.amountCents != null && booking.amountCents > 0 && (
          <p className="mt-2 text-center text-sm text-ink-muted">
            Paid {formatAudFromCents(booking.amountCents)}
          </p>
        )}
        {isCancelled && (
          <p className="mt-4 text-center text-sm font-medium text-red-600">Cancelled</p>
        )}
        {!isCancelled && !booking.canModify && booking.modifyBlockedReason && (
          <p className="mt-4 text-sm text-ink-muted">{booking.modifyBlockedReason}</p>
        )}
      </div>

      {success && (
        <p className="rounded-sm bg-brand-50 px-4 py-3 text-sm text-brand-800">{success}</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isCancelled && booking.status === 'confirmed' && (
        <BookingIntakeForm token={token} initialSubmitted={booking.intakeSubmitted} />
      )}

      {!isCancelled && booking.canModify && (
        <div className="space-y-4">
          <div className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40">
            <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
              Reschedule
            </h2>
            <p className="mt-2 text-sm text-ink-muted">Choose a new date and time.</p>
            <button
              type="button"
              onClick={() => setRescheduleOpen(v => !v)}
              className="btn-outline mt-4 text-sm"
            >
              {rescheduleOpen ? 'Close' : 'Change time'}
            </button>

            {rescheduleOpen && (
              <div className="mt-4 space-y-4 border-t border-sand-dark/40 pt-4">
                {loadingCalendar ? (
                  <p className="text-sm text-ink-muted">Loading available times…</p>
                ) : calendar.length === 0 ? (
                  <p className="text-sm text-ink-muted">No slots available right now.</p>
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
                <button
                  type="button"
                  disabled={!selectedDate || !selectedTime || submitting}
                  onClick={reschedule}
                  className="btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Confirm new time'}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-sm border border-red-200/80 bg-white p-6 shadow-card">
            <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
              Cancel appointment
            </h2>
            {booking.kind === 'treatment' && (
              <p className="mt-2 text-sm text-ink-muted">
                Your card payment will be refunded automatically when you cancel online.
              </p>
            )}
            {!confirmCancel ? (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="mt-4 text-sm text-red-600 underline hover:no-underline"
              >
                Cancel this appointment
              </button>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={cancel}
                  className="rounded-sm bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setConfirmCancel(false)}
                  className="btn-outline text-sm"
                >
                  Keep appointment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-center text-sm text-ink-muted">
        Need help?{' '}
        <Link href="/contact" className="text-brand-600 hover:underline">
          Contact us
        </Link>
        {clinicPhone ? (
          <>
            {' '}
            or call <a href={`tel:${clinicPhone}`} className="text-brand-600 hover:underline">{clinicPhone}</a>
          </>
        ) : null}
      </p>
    </div>
  )
}
