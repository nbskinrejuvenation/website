'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { AppointmentFilter, AppointmentKind, AppointmentListItem } from '@/lib/data/appointments-admin'
import type { ConsultationWithClient } from '@/lib/data/consultations-admin'
import type { TreatmentBookingWithRelations } from '@/lib/data/treatment-bookings-admin'
import { formatAdminWhen, formatAdminWhenLong } from '@/lib/admin/datetime'
import type { ConsultationStatus, TreatmentBookingStatus } from '@/types/database'
import { formatAudFromCents } from '@/lib/stripe/config'
import { ManageLinkActions } from '@/components/admin/ManageLinkActions'
import { ReschedulePanel } from '@/components/admin/ReschedulePanel'
import { cn } from '@/lib/utils/cn'

const CONSULT_STATUS: Record<ConsultationStatus, string> = {
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No show',
}

const TREAT_STATUS: Record<TreatmentBookingStatus, string> = {
  pending_payment: 'Awaiting payment',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No show',
}

interface Props {
  initialAppointments: AppointmentListItem[]
  filter: AppointmentFilter
  kind: AppointmentKind | 'all'
}

function itemKey(item: AppointmentListItem) {
  return `${item.kind}-${item.id}`
}

function parseSelected(param: string | null): string | null {
  if (!param) return null
  return param
}

export function AppointmentsInbox({ initialAppointments, filter, kind }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedParam = searchParams.get('selected')

  const [appointments, setAppointments] = useState(initialAppointments)
  const [selectedKey, setSelectedKey] = useState<string | null>(
    initialAppointments[0] ? itemKey(initialAppointments[0]) : null,
  )
  const [saving, setSaving] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setAppointments(initialAppointments)
  }, [initialAppointments])

  useEffect(() => {
    const key = parseSelected(selectedParam)
    if (key && appointments.some(a => itemKey(a) === key)) {
      setSelectedKey(key)
    }
  }, [selectedParam, appointments])

  const selected = appointments.find(a => itemKey(a) === selectedKey) ?? null

  const filterTabs: Array<{ key: AppointmentFilter; label: string; href: string }> = [
    { key: 'upcoming', label: 'Upcoming', href: buildHref('upcoming', kind) },
    { key: 'pending_payment', label: 'Awaiting payment', href: buildHref('pending_payment', kind) },
    { key: 'all', label: 'All', href: buildHref('all', kind) },
    { key: 'cancelled', label: 'Cancelled', href: buildHref('cancelled', kind) },
  ]

  const kindTabs: Array<{ key: AppointmentKind | 'all'; label: string; href: string }> = [
    { key: 'all', label: 'All types', href: buildHref(filter, 'all') },
    { key: 'consultation', label: 'Consultations', href: buildHref(filter, 'consultation') },
    { key: 'treatment', label: 'Paid treatments', href: buildHref(filter, 'treatment') },
  ]

  const patchConsultation = async (
    id: string,
    body: { status?: ConsultationStatus; internal_notes?: string | null },
  ) => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = (await res.json()) as {
        consultation?: ConsultationWithClient
        error?: string
        calendarEventRemoved?: boolean
        cancellationEmail?: { sent: boolean; error: string | null; recipient: string | null }
      }
      if (!res.ok) throw new Error(json.error ?? 'Update failed')
      if (json.consultation) {
        updateItemFromConsultation(json.consultation)
      }
      setCancelMessage(json.consultation?.status === 'cancelled', json)
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const patchTreatment = async (
    id: string,
    body: {
      status?: TreatmentBookingStatus
      internal_notes?: string | null
      refund?: boolean
    },
  ) => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/treatment-bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = (await res.json()) as {
        booking?: TreatmentBookingWithRelations
        error?: string
        cancellationEmail?: { sent: boolean; error: string | null }
        refund?: { issued: boolean; error: string | null; amountCents: number | null }
      }
      if (!res.ok) throw new Error(json.error ?? 'Update failed')
      if (json.booking) {
        updateItemFromTreatment(json.booking)
      }
      setCancelMessage(json.booking?.status === 'cancelled', json, body.refund)
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const setCancelMessage = (
    cancelled: boolean | undefined,
    json: {
      cancellationEmail?: { sent: boolean; error: string | null; recipient?: string | null }
      calendarEventRemoved?: boolean
      refund?: { issued: boolean; error: string | null; amountCents: number | null }
    },
    requestedRefund?: boolean,
  ) => {
    if (!cancelled) {
      setMessage('Saved')
      return
    }
    const parts = ['Saved — booking cancelled']
    if (json.cancellationEmail?.sent) {
      parts.push(`email sent to ${json.cancellationEmail.recipient}`)
    } else if (json.cancellationEmail) {
      parts.push(`email failed: ${json.cancellationEmail.error ?? 'unknown'}`)
    }
    if (json.calendarEventRemoved) parts.push('calendar event removed')
    if (json.refund?.issued) {
      parts.push(`refund issued (${formatAudFromCents(json.refund.amountCents ?? 0)})`)
    } else if (json.refund && requestedRefund) {
      parts.push(`refund failed: ${json.refund.error ?? 'unknown'}`)
    }
    setMessage(parts.join('. '))
  }

  const updateItemFromConsultation = (c: ConsultationWithClient) => {
    setAppointments(prev =>
      prev.map(a =>
        a.kind === 'consultation' && a.id === c.id
          ? {
              ...a,
              status: c.status,
              starts_at: c.starts_at,
              client: c.client,
              consultation: c,
            }
          : a,
      ),
    )
  }

  const updateItemFromTreatment = (t: TreatmentBookingWithRelations) => {
    setAppointments(prev =>
      prev.map(a =>
        a.kind === 'treatment' && a.id === t.id
          ? {
              ...a,
              status: t.status,
              starts_at: t.starts_at,
              client: t.client,
              label: t.treatment.title,
              amount_cents: t.amount_cents,
              treatment: t,
            }
          : a,
      ),
    )
  }

  const resendCancellationEmail = async (id: string) => {
    setResendingEmail(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/consultations/${id}/resend-cancellation-email`, {
        method: 'POST',
      })
      const json = (await res.json()) as { sent?: boolean; error?: string | null; recipient?: string | null }
      if (!res.ok) throw new Error(json.error ?? 'Resend failed')
      setMessage(
        json.sent
          ? `Cancellation email sent to ${json.recipient}`
          : `Email not sent: ${json.error ?? 'unknown'}`,
      )
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Resend failed')
    } finally {
      setResendingEmail(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {kindTabs.map(tab => (
          <a
            key={tab.key}
            href={tab.href}
            className={cn(
              'rounded-sm border px-3 py-1.5 text-xs font-medium uppercase tracking-wide',
              kind === tab.key
                ? 'border-brand-500 bg-brand-500 text-cream'
                : 'border-sand-dark text-ink-muted hover:border-brand-300',
            )}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-sand-dark/50 pb-0">
        {filterTabs.map(tab => (
          <a
            key={tab.key}
            href={tab.href}
            className={cn(
              'rounded-t-sm px-4 py-2 text-sm transition-colors',
              filter === tab.key
                ? 'bg-white font-medium text-ink ring-1 ring-sand-dark/40'
                : 'text-ink-muted hover:bg-white/60',
            )}
          >
            {tab.label}
          </a>
        ))}
      </nav>

      <div className="grid gap-0 overflow-hidden rounded-sm bg-white shadow-card ring-1 ring-sand-dark/40 lg:grid-cols-5">
        <aside className="border-b border-sand-dark/40 lg:col-span-2 lg:border-b-0 lg:border-r">
          {appointments.length === 0 ? (
            <p className="p-8 text-sm text-ink-muted">No appointments in this view.</p>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-sand-dark/40 overflow-y-auto">
              {appointments.map(a => {
                const key = itemKey(a)
                const statusLabel =
                  a.kind === 'consultation'
                    ? CONSULT_STATUS[a.status as ConsultationStatus]
                    : TREAT_STATUS[a.status as TreatmentBookingStatus]
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => setSelectedKey(key)}
                      className={cn(
                        'w-full px-5 py-4 text-left transition-colors hover:bg-brand-50/50',
                        selectedKey === key && 'bg-brand-50 ring-1 ring-inset ring-brand-200',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-ink">{a.client.full_name}</p>
                        <span
                          className={cn(
                            'shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                            a.kind === 'treatment'
                              ? 'bg-brand-100 text-brand-700'
                              : 'bg-sand text-ink-muted',
                          )}
                        >
                          {a.kind === 'treatment' ? 'Paid' : 'Consult'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-brand-600">{a.label}</p>
                      <p className="mt-1 text-sm text-ink-muted">{formatAdminWhen(a.starts_at)}</p>
                      <p className="mt-2 text-xs text-ink-faint">{statusLabel}</p>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>

        <main className="bg-cream p-6 lg:col-span-3 lg:p-8">
          {!selected ? (
            <p className="text-sm text-ink-muted">Select an appointment</p>
          ) : selected.kind === 'consultation' && selected.consultation ? (
            <ConsultationDetailPanel
              consultation={selected.consultation}
              saving={saving}
              resendingEmail={resendingEmail}
              message={message}
              onPatch={patchConsultation}
              onResendCancellationEmail={resendCancellationEmail}
              onRescheduled={() => router.refresh()}
            />
          ) : selected.kind === 'treatment' && selected.treatment ? (
            <TreatmentDetailPanel
              booking={selected.treatment}
              saving={saving}
              message={message}
              onPatch={patchTreatment}
              onRefund={async id => {
                setSaving(true)
                setMessage(null)
                try {
                  const res = await fetch(`/api/admin/treatment-bookings/${id}/refund`, {
                    method: 'POST',
                  })
                  const json = (await res.json()) as {
                    error?: string
                    refund?: { issued: boolean; amountCents: number | null }
                  }
                  if (!res.ok) throw new Error(json.error ?? 'Refund failed')
                  setMessage(
                    `Refund issued (${formatAudFromCents(json.refund?.amountCents ?? 0)})`,
                  )
                  router.refresh()
                } catch (err) {
                  setMessage(err instanceof Error ? err.message : 'Refund failed')
                } finally {
                  setSaving(false)
                }
              }}
              onRescheduled={() => router.refresh()}
            />
          ) : null}
        </main>
      </div>
    </div>
  )
}

function buildHref(filter: AppointmentFilter, kind: AppointmentKind | 'all'): string {
  const params = new URLSearchParams()
  if (filter !== 'upcoming') params.set('filter', filter)
  if (kind !== 'all') params.set('kind', kind)
  const q = params.toString()
  return q ? `/admin/appointments?${q}` : '/admin/appointments'
}

function ConsultationDetailPanel({
  consultation: c,
  saving,
  resendingEmail,
  message,
  onPatch,
  onResendCancellationEmail,
  onRescheduled,
}: {
  consultation: ConsultationWithClient
  saving: boolean
  resendingEmail: boolean
  message: string | null
  onPatch: (id: string, body: { status?: ConsultationStatus; internal_notes?: string | null }) => void
  onResendCancellationEmail: (id: string) => void
  onRescheduled: () => void
}) {
  const [notes, setNotes] = useState(c.internal_notes ?? '')

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-light text-ink">{c.client.full_name}</h2>
        <p className="mt-1 text-lg text-ink-muted">{formatAdminWhenLong(c.starts_at)}</p>
        <p className="mt-1 text-sm text-ink-faint">30 min · Free consultation</p>
      </div>

      <ClientContact client={c.client} />
      {c.management_token && c.status === 'confirmed' && (
        <ManageLinkActions managementToken={c.management_token} clientPhone={c.client.phone} />
      )}
      {c.treatment_interest && (
        <Field label="Interest" value={c.treatment_interest} />
      )}
      {c.message && <Field label="Client message" value={c.message} multiline />}

      {c.status === 'confirmed' && (
        <ReschedulePanel
          kind="consultation"
          bookingId={c.id}
          currentStartsAt={c.starts_at}
          onRescheduled={() => onRescheduled()}
        />
      )}

      <StatusButtons
        statuses={['confirmed', 'completed', 'cancelled', 'no_show'] as const}
        current={c.status}
        labels={CONSULT_STATUS}
        saving={saving}
        onSelect={status => onPatch(c.id, { status })}
      />

      {c.status === 'cancelled' && (
        <div className="rounded-sm border border-sand-dark/60 bg-cream-dark/50 p-4">
          <button
            type="button"
            disabled={saving || resendingEmail}
            onClick={() => onResendCancellationEmail(c.id)}
            className="btn-outline disabled:opacity-50"
          >
            {resendingEmail ? 'Sending…' : 'Resend cancellation email'}
          </button>
        </div>
      )}

      <NotesField notes={notes} setNotes={setNotes} saving={saving} onSave={() => onPatch(c.id, { internal_notes: notes || null })} />

      {c.google_calendar_synced && (
        <p className="text-xs text-ink-faint">Synced to Google Calendar</p>
      )}
      {message && <MessageLine message={message} />}
    </div>
  )
}

function TreatmentDetailPanel({
  booking: b,
  saving,
  message,
  onPatch,
  onRefund,
  onRescheduled,
}: {
  booking: TreatmentBookingWithRelations
  saving: boolean
  message: string | null
  onPatch: (
    id: string,
    body: { status?: TreatmentBookingStatus; internal_notes?: string | null; refund?: boolean },
  ) => void
  onRefund: (id: string) => void
  onRescheduled: () => void
}) {
  const [notes, setNotes] = useState(b.internal_notes ?? '')
  const [refundOnCancel, setRefundOnCancel] = useState(true)
  const canRefund = Boolean(b.stripe_payment_intent_id)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-light text-ink">{b.client.full_name}</h2>
        <p className="mt-1 text-lg text-ink-muted">{formatAdminWhenLong(b.starts_at)}</p>
        <p className="mt-1 text-sm text-brand-600">
          {b.treatment.title} · {formatAudFromCents(b.amount_cents)} paid
        </p>
      </div>

      <ClientContact client={b.client} />
      {b.management_token && b.status === 'confirmed' && (
        <ManageLinkActions managementToken={b.management_token} clientPhone={b.client.phone} />
      )}
      {b.message && <Field label="Client message" value={b.message} multiline />}

      {b.status === 'confirmed' && (
        <ReschedulePanel
          kind="treatment"
          bookingId={b.id}
          currentStartsAt={b.starts_at}
          onRescheduled={() => onRescheduled()}
        />
      )}

      <StatusButtons
        statuses={['confirmed', 'completed', 'cancelled', 'no_show'] as const}
        current={b.status === 'pending_payment' ? 'confirmed' : b.status}
        labels={TREAT_STATUS}
        saving={saving || b.status === 'pending_payment'}
        onSelect={status => {
          if (status === 'cancelled' && b.status === 'confirmed') {
            onPatch(b.id, { status, refund: canRefund && refundOnCancel })
          } else {
            onPatch(b.id, { status })
          }
        }}
        disabledNote={
          b.status === 'pending_payment'
            ? 'Awaiting Stripe payment — slot held for 30 minutes.'
            : undefined
        }
      />

      {b.status === 'confirmed' && canRefund && (
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={refundOnCancel}
            onChange={e => setRefundOnCancel(e.target.checked)}
            className="h-4 w-4 rounded border-sand-dark"
          />
          Refund {formatAudFromCents(b.amount_cents)} when cancelling
        </label>
      )}

      {b.status === 'confirmed' && canRefund && (
        <button
          type="button"
          disabled={saving}
          onClick={() => onRefund(b.id)}
          className="btn-outline text-sm disabled:opacity-50"
        >
          Issue refund (keep appointment confirmed)
        </button>
      )}

      {b.status !== 'pending_payment' && (
        <NotesField notes={notes} setNotes={setNotes} saving={saving} onSave={() => onPatch(b.id, { internal_notes: notes || null })} />
      )}

      {b.google_calendar_synced && (
        <p className="text-xs text-ink-faint">Synced to Google Calendar</p>
      )}
      {message && <MessageLine message={message} />}
    </div>
  )
}

function ClientContact({ client }: { client: { full_name: string; email: string; phone: string | null } }) {
  return (
    <dl className="grid gap-4 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-xs font-medium uppercase tracking-widest text-ink-faint">Email</dt>
        <dd className="mt-1">
          <a href={`mailto:${client.email}`} className="text-brand-600 hover:underline">
            {client.email}
          </a>
        </dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-widest text-ink-faint">Phone</dt>
        <dd className="mt-1">
          {client.phone ? (
            <a href={`tel:${client.phone.replace(/\s/g, '')}`} className="text-brand-600 hover:underline">
              {client.phone}
            </a>
          ) : (
            '—'
          )}
        </dd>
      </div>
    </dl>
  )
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-widest text-ink-faint">{label}</dt>
      <dd className={cn('mt-1 text-ink-muted', multiline && 'whitespace-pre-wrap')}>{value}</dd>
    </div>
  )
}

function StatusButtons<T extends string>({
  statuses,
  current,
  labels,
  saving,
  onSelect,
  disabledNote,
}: {
  statuses: readonly T[]
  current: T
  labels: Record<T, string>
  saving: boolean
  onSelect: (status: T) => void
  disabledNote?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-faint">
        Status
      </label>
      {disabledNote && <p className="mb-2 text-sm text-amber-800">{disabledNote}</p>}
      <div className="flex flex-wrap gap-2">
        {statuses.map(status => (
          <button
            key={status}
            type="button"
            disabled={saving || current === status}
            onClick={() => onSelect(status)}
            className={cn(
              'rounded-sm border px-3 py-1.5 text-xs font-medium uppercase tracking-wide',
              current === status
                ? 'border-brand-500 bg-brand-500 text-cream'
                : 'border-sand-dark text-ink-muted hover:border-brand-300',
            )}
          >
            {labels[status]}
          </button>
        ))}
      </div>
    </div>
  )
}

function NotesField({
  notes,
  setNotes,
  saving,
  onSave,
}: {
  notes: string
  setNotes: (v: string) => void
  saving: boolean
  onSave: () => void
}) {
  return (
    <div>
      <label htmlFor="internal_notes" className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-faint">
        Internal notes
      </label>
      <textarea
        id="internal_notes"
        rows={4}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        className="w-full rounded-sm border border-sand-dark px-4 py-2.5 text-sm"
      />
      <button type="button" disabled={saving} onClick={onSave} className="btn-outline mt-3 disabled:opacity-50">
        Save notes
      </button>
    </div>
  )
}

function MessageLine({ message }: { message: string }) {
  return (
    <p
      className={cn(
        'text-sm',
        message.includes('failed') || message.includes('not sent') ? 'text-red-600' : 'text-brand-600',
      )}
    >
      {message}
    </p>
  )
}
