'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ConsultationWithClient } from '@/lib/data/consultations-admin'
import type { ConsultationStatus } from '@/types/database'
import { cn } from '@/lib/utils/cn'

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No show',
}

interface Props {
  initialConsultations: ConsultationWithClient[]
  filter: 'upcoming' | 'all' | ConsultationStatus
}

export function ConsultationInbox({ initialConsultations, filter }: Props) {
  const router = useRouter()
  const [consultations, setConsultations] = useState(initialConsultations)
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConsultations[0]?.id ?? null,
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const selected = consultations.find(c => c.id === selectedId) ?? null

  const formatWhen = (iso: string) =>
    new Date(iso).toLocaleString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Australia/Sydney',
    })

  const patch = async (id: string, body: { status?: ConsultationStatus; internal_notes?: string | null }) => {
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
        calendarEventRemoved?: boolean
        error?: string
      }
      if (!res.ok) throw new Error(json.error ?? 'Update failed')
      if (json.consultation) {
        setConsultations(prev => prev.map(c => (c.id === id ? json.consultation! : c)))
      }
      if (json.calendarEventRemoved) {
        setMessage('Saved — Google Calendar event removed and client notified')
      } else {
        setMessage('Saved')
      }
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const tabs: Array<{ key: Props['filter']; label: string; href: string }> = [
    { key: 'upcoming', label: 'Upcoming', href: '/admin/consultations' },
    { key: 'all', label: 'All', href: '/admin/consultations?filter=all' },
    { key: 'completed', label: 'Completed', href: '/admin/consultations?filter=completed' },
    { key: 'cancelled', label: 'Cancelled', href: '/admin/consultations?filter=cancelled' },
  ]

  return (
    <div className="min-h-screen bg-cream-dark">
      <header className="border-b border-sand-dark/60 bg-brand-800 text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-200">
              Naturally Beautiful
            </p>
            <h1 className="font-display text-xl font-light">Consultation inbox</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-brand-100 hover:text-cream" target="_blank" rel="noreferrer">
              View site
            </a>
            <button
              type="button"
              onClick={logout}
              className="rounded-sm border border-cream/30 px-3 py-1.5 text-sm hover:bg-cream/10"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 px-5 pb-0">
          {tabs.map(tab => (
            <a
              key={tab.key}
              href={tab.href}
              className={cn(
                'rounded-t-sm px-4 py-2 text-sm transition-colors',
                filter === tab.key
                  ? 'bg-cream-dark font-medium text-ink'
                  : 'text-brand-100 hover:bg-brand-700/50',
              )}
            >
              {tab.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-5">
        <aside className="border-b border-sand-dark/50 bg-cream lg:col-span-2 lg:border-b-0 lg:border-r">
          {consultations.length === 0 ? (
            <p className="p-8 text-sm text-ink-muted">No consultations in this view.</p>
          ) : (
            <ul className="divide-y divide-sand-dark/40">
              {consultations.map(c => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      'w-full px-5 py-4 text-left transition-colors hover:bg-brand-50/50',
                      selectedId === c.id && 'bg-brand-50 ring-1 ring-inset ring-brand-200',
                    )}
                  >
                    <p className="font-medium text-ink">{c.client.full_name}</p>
                    <p className="mt-1 text-sm text-ink-muted">{formatWhen(c.starts_at)}</p>
                    <p className="mt-2 text-xs text-brand-600">{STATUS_LABELS[c.status]}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="bg-cream p-6 lg:col-span-3 lg:p-8">
          {!selected ? (
            <p className="text-sm text-ink-muted">Select a consultation</p>
          ) : (
            <ConsultationDetail
              consultation={selected}
              saving={saving}
              message={message}
              onPatch={patch}
              formatWhen={formatWhen}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function ConsultationDetail({
  consultation: c,
  saving,
  message,
  onPatch,
  formatWhen,
}: {
  consultation: ConsultationWithClient
  saving: boolean
  message: string | null
  onPatch: (id: string, body: { status?: ConsultationStatus; internal_notes?: string | null }) => void
  formatWhen: (iso: string) => string
}) {
  const [notes, setNotes] = useState(c.internal_notes ?? '')

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-light text-ink">{c.client.full_name}</h2>
        <p className="mt-1 text-lg text-ink-muted">{formatWhen(c.starts_at)}</p>
        <p className="mt-1 text-sm text-ink-faint">30 min · Free consultation</p>
      </div>

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-widest text-ink-faint">Email</dt>
          <dd className="mt-1">
            <a href={`mailto:${c.client.email}`} className="text-brand-600 hover:underline">
              {c.client.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-widest text-ink-faint">Phone</dt>
          <dd className="mt-1">
            {c.client.phone ? (
              <a href={`tel:${c.client.phone.replace(/\s/g, '')}`} className="text-brand-600 hover:underline">
                {c.client.phone}
              </a>
            ) : (
              '—'
            )}
          </dd>
        </div>
        {c.treatment_interest && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-widest text-ink-faint">Interest</dt>
            <dd className="mt-1">{c.treatment_interest}</dd>
          </div>
        )}
        {c.message && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-widest text-ink-faint">Client message</dt>
            <dd className="mt-1 whitespace-pre-wrap text-ink-muted">{c.message}</dd>
          </div>
        )}
      </dl>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-faint">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {(['confirmed', 'completed', 'cancelled', 'no_show'] as const).map(status => (
            <button
              key={status}
              type="button"
              disabled={saving || c.status === status}
              onClick={() => onPatch(c.id, { status })}
              className={cn(
                'rounded-sm border px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors',
                c.status === status
                  ? 'border-brand-500 bg-brand-500 text-cream'
                  : 'border-sand-dark text-ink-muted hover:border-brand-300',
              )}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

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
          placeholder="Skin type, follow-up, products discussed…"
        />
        <button
          type="button"
          disabled={saving}
          onClick={() => onPatch(c.id, { internal_notes: notes || null })}
          className="btn-outline mt-3 disabled:opacity-50"
        >
          Save notes
        </button>
      </div>

      {c.google_calendar_synced && (
        <p className="text-xs text-ink-faint">Synced to Google Calendar</p>
      )}

      {message && <p className="text-sm text-brand-600">{message}</p>}
    </div>
  )
}
