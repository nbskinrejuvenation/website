'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Calendar, CreditCard, Loader2, Phone } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const formSchema = z.object({
  full_name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  message: z.string().max(2000).optional(),
})

type FormData = z.infer<typeof formSchema>

type CalendarDay = { date: string; slots: string[] }

interface Props {
  slug: string
  treatmentTitle: string
  durationMinutes: number
  chargeLabel: string
  phone?: string
  cancelled?: boolean
}

type Step = 'datetime' | 'details'

export function TreatmentBooking({
  slug,
  treatmentTitle,
  durationMinutes,
  chargeLabel,
  phone,
  cancelled,
}: Props) {
  const [step, setStep] = useState<Step>('datetime')
  const [calendar, setCalendar] = useState<CalendarDay[]>([])
  const [loadingCalendar, setLoadingCalendar] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(formSchema) })

  const loadCalendar = useCallback(async () => {
    setLoadingCalendar(true)
    try {
      const res = await fetch(`/api/booking/treatment/slots?slug=${encodeURIComponent(slug)}`)
      const data = (await res.json()) as { calendar?: CalendarDay[] }
      setCalendar(data.calendar ?? [])
    } catch {
      setCalendar([])
    } finally {
      setLoadingCalendar(false)
    }
  }, [slug])

  useEffect(() => {
    void loadCalendar()
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
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/booking/treatment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          slug,
          date: selectedDate,
          time: selectedTime,
          source_page: window.location.pathname,
        }),
      })
      const json = (await res.json()) as { error?: string; checkoutUrl?: string }
      if (!res.ok) throw new Error(json.error ?? 'Checkout failed')
      if (!json.checkoutUrl) throw new Error('No checkout URL returned')
      window.location.href = json.checkoutUrl
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setSubmitError(msg)
      if (msg.includes('slot')) void loadCalendar()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <p className="eyebrow mb-2">Step {step === 'datetime' ? '1' : '2'} of 2</p>
        <h2 className="font-display text-2xl font-light text-ink md:text-3xl">
          {step === 'datetime' ? 'Choose a time' : 'Your details'}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {treatmentTitle} · {durationMinutes} min · Pay {chargeLabel} to confirm
        </p>
        {cancelled && (
          <p className="mt-4 rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
            Payment was cancelled. Your time slot has been released — choose another time to continue.
          </p>
        )}
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
                No online slots available right now. Please call us to book this treatment.
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
                {formatDayLabel(selectedDate)} at {selectedTime} · {chargeLabel}
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
              <Field label="Notes (optional)" error={errors.message?.message}>
                <textarea
                  {...register('message')}
                  rows={3}
                  className={inputClass(!!errors.message)}
                  placeholder="Anything we should know before your appointment…"
                />
              </Field>
            </div>

            {submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}

            <p className="mt-6 flex items-start gap-2 text-xs text-ink-muted">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
              You&apos;ll be redirected to Stripe to pay {chargeLabel}. Your appointment is confirmed
              once payment succeeds.
            </p>

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
                {submitting ? 'Redirecting…' : `Pay ${chargeLabel}`}
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-ink-faint">
              Prefer a free chat first?{' '}
              <Link href="/book" className="text-brand-600 hover:underline">
                Book a free consultation
              </Link>
            </p>
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
