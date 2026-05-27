'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Loader2 } from 'lucide-react'

interface Props {
  sessionId: string
  treatmentTitle: string
}

export function TreatmentBookingSuccess({ sessionId, treatmentTitle }: Props) {
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'pending' | 'error'>('loading')
  const [when, setWhen] = useState<string | null>(null)
  const [manageUrl, setManageUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function verify() {
      try {
        const res = await fetch(
          `/api/booking/treatment/status?session_id=${encodeURIComponent(sessionId)}`,
        )
        const json = (await res.json()) as {
          status?: string
          startsAt?: string
          manageUrl?: string | null
          error?: string
        }
        if (cancelled) return

        if (!res.ok) {
          setStatus('error')
          return
        }

        if (json.status === 'confirmed' && json.startsAt) {
          setStatus('confirmed')
          setManageUrl(json.manageUrl ?? null)
          setWhen(
            new Date(json.startsAt).toLocaleString('en-AU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: 'numeric',
              minute: '2-digit',
              timeZone: 'Australia/Sydney',
            }),
          )
        } else {
          setStatus('pending')
          setTimeout(verify, 2000)
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    void verify()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  if (status === 'loading' || status === 'pending') {
    return (
      <div className="rounded-sm bg-brand-50 p-10 text-center ring-1 ring-brand-200">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-600" />
        <h2 className="mt-4 font-display text-2xl font-light text-ink">Confirming payment…</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
          Please wait while we confirm your {treatmentTitle} appointment.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-sm bg-white p-10 text-center shadow-card ring-1 ring-sand-dark/40">
        <h2 className="font-display text-2xl font-light text-ink">Payment received</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink-muted">
          We&apos;re processing your booking. If you don&apos;t receive a confirmation email within a
          few minutes, please call the clinic.
        </p>
        <Link href="/" className="btn-outline mt-8 inline-flex">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-sm bg-brand-50 p-10 text-center ring-1 ring-brand-200">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <Check className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h2 className="font-display text-2xl font-light text-ink">You&apos;re booked</h2>
      <p className="mt-2 text-sm text-brand-700">{treatmentTitle}</p>
      {when && <p className="mt-3 text-ink-muted">{when}</p>}
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
        A confirmation email is on its way. You may also receive a Google Calendar invitation.
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
