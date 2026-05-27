'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Calendar, Check, Loader2, Phone } from 'lucide-react'
import { PrivacyConsentField } from '@/components/booking/PrivacyConsentField'
import { cn } from '@/lib/utils/cn'

const formSchema = z.object({
  full_name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  treatment_interest: z.string().optional(),
  message: z.string().max(2000).optional(),
})

type FormData = z.infer<typeof formSchema>

const TREATMENT_OPTIONS = [
  'Face treatments',
  'Body treatments',
  'Tattoo removal',
  'Not sure — need advice',
]

type CalendarDay = { date: string; slots: string[] }

interface Props {
  phone?: string
}

type Step = 'datetime' | 'details' | 'done'

export function ConsultationBooking({ phone }: Props) {
  const [step, setStep] = useState<Step>('datetime')
  const [calendar, setCalendar] = useState<CalendarDay[]>([])
  const [loadingCalendar, setLoadingCalendar] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmedStart, setConfirmedStart] = useState<string | null>(null)
  const [manageUrl, setManageUrl] = useState<string | null>(null)
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false)
  const [calendarSynced, setCalendarSynced] = useState(false)
  const [privacyConsent, setPrivacyConsent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(formSchema) })

  const loadCalendar = useCallback(async () => {
    setLoadingCalendar(true)
    try {
      const res = await fetch('/api/booking/slots')
      const data = (await res.json()) as { calendar?: CalendarDay[] }
      setCalendar(data.calendar ?? [])
    } catch {
      setCalendar([])
    } finally {
      setLoadingCalendar(false)
    }
  }, [])

  useEffect(() => {
    loadCalendar()
  }, [loadCalendar])

  const selectedDay = calendar.find(d => d.date === selectedDate)
  const slots = selectedDay?.slots ?? []

  const formatDayLabel = (dateKey: string) => {
    const d = new Date(`${dateKey}T12:00:00`)
    return d.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'Australia/Sydney',
    })
  }

  const onSubmit = async (data: FormData) => {
    if (!selectedDate || !selectedTime) return
    if (!privacyConsent) {
      setSubmitError('Please accept the privacy policy to continue.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/booking/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          date: selectedDate,
          time: selectedTime,
          source_page: window.location.pathname,
          privacy_consent: true,
        }),
      })
      const json = (await res.json()) as {
        error?: string
        startsAt?: string
        manageUrl?: string
        confirmationEmailSent?: boolean
        calendarSynced?: boolean
      }
      if (!res.ok) throw new Error(json.error ?? 'Booking failed')
      setConfirmedStart(json.startsAt ?? null)
      setManageUrl(json.manageUrl ?? null)
      setConfirmationEmailSent(json.confirmationEmailSent ?? false)
      setCalendarSynced(json.calendarSynced ?? false)
      setStep('done')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setSubmitError(msg)
      if (msg.includes('slot')) void loadCalendar()
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'done') {
    const when = confirmedStart
      ? new Date(confirmedStart).toLocaleString('en-AU', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'Australia/Sydney',
        })
      : null

    return (
      <div className="rounded-sm bg-brand-50 p-10 text-center ring-1 ring-brand-200">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <Check className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-2xl font-light text-ink">You&apos;re booked</h2>
        {when && <p className="mt-3 text-ink-muted">{when}</p>}
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
          {confirmationEmailSent
            ? 'A confirmation email is on its way to your inbox.'
            : 'We\u2019ve saved your booking. If you don\u2019t receive a confirmation email shortly, check your spam folder or call us.'}
          {calendarSynced && ' You\u2019ll also receive a Google Calendar invitation.'}
        </p>
        {manageUrl && (
          <Link href={manageUrl} className="btn-primary mt-6 inline-flex">
            Manage appointment
          </Link>
        )}
        <Link href="/" className="btn-outline mt-4 inline-flex">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <p className="eyebrow mb-2">Step {step === 'datetime' ? '1' : '2'} of 2</p>
        <h2 className="font-display text-2xl font-light text-ink md:text-3xl">
          {step === 'datetime' ? 'Choose a time' : 'Your details'}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Free 30-minute consultation · By appointment · Dee Why clinic
        </p>
        {phone && (
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Phone className="h-4 w-4" />
            Prefer to call? {phone}
          </a>
        )}
      </div>

      <div className="lg:col-span-3">
        {step === 'datetime' && (
          <div className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40 md:p-8">
            {loadingCalendar ? (
              <div className="flex items-center justify-center gap-2 py-16 text-ink-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading available times…
              </div>
            ) : calendar.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-muted">
                No online slots available right now. Please call us to arrange a consultation.
              </p>
            ) : (
              <>
                <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-ink-faint">
                  <Calendar className="h-4 w-4" />
                  Select a day
                </p>
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
                        'rounded-sm border px-3 py-2 text-sm transition-colors',
                        selectedDate === day.date
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-sand-dark/60 text-ink-muted hover:border-brand-300',
                      )}
                    >
                      {formatDayLabel(day.date)}
                    </button>
                  ))}
                </div>

                {selectedDate && (
                  <>
                    <p className="mb-3 mt-8 text-xs font-medium uppercase tracking-widest text-ink-faint">
                      Select a time
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            'rounded-sm border py-2.5 text-sm transition-colors',
                            selectedTime === time
                              ? 'border-brand-500 bg-brand-500 text-cream'
                              : 'border-sand-dark/60 text-ink hover:border-brand-300',
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <button
                  type="button"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep('details')}
                  className="btn-primary mt-8 w-full disabled:opacity-50"
                >
                  Continue
                </button>
              </>
            )}
          </div>
        )}

        {step === 'details' && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40 md:p-8"
          >
            {selectedDate && selectedTime && (
              <p className="mb-6 rounded-sm bg-brand-50 px-4 py-3 text-sm text-brand-800">
                {formatDayLabel(selectedDate)} at {selectedTime}
                <button
                  type="button"
                  className="ml-2 underline hover:no-underline"
                  onClick={() => setStep('datetime')}
                >
                  Change
                </button>
              </p>
            )}

            <div className="space-y-4">
              <Field label="Your name *" error={errors.full_name?.message}>
                <input
                  {...register('full_name')}
                  className={inputClass(!!errors.full_name)}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email *" error={errors.email?.message}>
                <input
                  {...register('email')}
                  type="email"
                  className={inputClass(!!errors.email)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Phone *" error={errors.phone?.message}>
                <input
                  {...register('phone')}
                  type="tel"
                  className={inputClass(!!errors.phone)}
                  autoComplete="tel"
                />
              </Field>
              <Field label="Interested in">
                <select {...register('treatment_interest')} className={inputClass(false)}>
                  <option value="">Select…</option>
                  {TREATMENT_OPTIONS.map(o => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Notes (optional)" error={errors.message?.message}>
                <textarea
                  {...register('message')}
                  rows={3}
                  className={inputClass(!!errors.message)}
                  placeholder="Skin concerns or questions…"
                />
              </Field>
            </div>

            <div className="mt-6">
              <PrivacyConsentField
                checked={privacyConsent}
                onChange={setPrivacyConsent}
              />
            </div>

            {submitError && (
              <p className="mt-4 text-sm text-red-600">{submitError}</p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep('datetime')}
                className="btn-outline flex-1"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {submitting ? 'Booking…' : 'Confirm booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full rounded-sm border px-4 py-2.5 text-sm text-ink',
    'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1',
    hasError ? 'border-red-400' : 'border-sand-dark',
  )
}
