'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { ClientDetail, ClientWithStats } from '@/lib/data/clients-admin'
import { formatAdminWhen } from '@/lib/admin/datetime'
import { cn } from '@/lib/utils/cn'

interface Props {
  initialClients: ClientWithStats[]
  initialDetail: ClientDetail | null
  selectedId: string | null
  search: string
}

export function ClientsDirectory({
  initialClients,
  initialDetail,
  selectedId,
  search: initialSearch,
}: Props) {
  const router = useRouter()
  const [clients] = useState(initialClients)
  const detail = initialDetail
  const [search, setSearch] = useState(initialSearch)
  const [notes, setNotes] = useState(initialDetail?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setNotes(initialDetail?.notes ?? '')
    setMessage(null)
  }, [initialDetail])

  const selected = clients.find(c => c.id === selectedId) ?? null

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    router.push(params.toString() ? `/admin/clients?${params}` : '/admin/clients')
  }

  const saveNotes = async () => {
    if (!detail) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/clients/${detail.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes || null }),
      })
      const json = (await res.json()) as { client?: { notes: string | null }; error?: string }
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      setMessage('Notes saved')
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-0 overflow-hidden rounded-sm bg-white shadow-card ring-1 ring-sand-dark/40 lg:grid-cols-5">
      <aside className="border-b border-sand-dark/40 p-4 lg:col-span-2 lg:border-b-0 lg:border-r">
        <form onSubmit={applySearch} className="mb-4">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full rounded-sm border border-sand-dark px-3 py-2 text-sm"
          />
        </form>

        {clients.length === 0 ? (
          <p className="text-sm text-ink-muted">No clients found.</p>
        ) : (
          <ul className="max-h-[65vh] divide-y divide-sand-dark/40 overflow-y-auto">
            {clients.map(c => (
              <li key={c.id}>
                <a
                  href={`/admin/clients?id=${c.id}${initialSearch ? `&q=${encodeURIComponent(initialSearch)}` : ''}`}
                  className={cn(
                    'block px-3 py-3 transition-colors hover:bg-brand-50/50',
                    selectedId === c.id && 'bg-brand-50 ring-1 ring-inset ring-brand-200',
                  )}
                >
                  <p className="font-medium text-ink">{c.full_name}</p>
                  <p className="text-xs text-ink-muted">{c.email}</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {c.consultation_count} consult · {c.treatment_count} paid
                    {c.last_visit_at && ` · Last ${formatAdminWhen(c.last_visit_at)}`}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className="bg-cream p-6 lg:col-span-3 lg:p-8">
        {!selected || !detail ? (
          <p className="text-sm text-ink-muted">Select a client to view history and notes.</p>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-light text-ink">{detail.full_name}</h2>
              <p className="mt-1 text-sm text-ink-muted">{detail.email}</p>
              {detail.phone && (
                <a
                  href={`tel:${detail.phone.replace(/\s/g, '')}`}
                  className="mt-1 inline-block text-sm text-brand-600 hover:underline"
                >
                  {detail.phone}
                </a>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-faint">
                Client notes
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-sm border border-sand-dark px-4 py-2.5 text-sm"
                placeholder="Allergies, preferences, skin history…"
              />
              <button
                type="button"
                disabled={saving}
                onClick={saveNotes}
                className="btn-outline mt-3 disabled:opacity-50"
              >
                Save notes
              </button>
              {message && <p className="mt-2 text-sm text-brand-600">{message}</p>}
            </div>

            <BookingHistory detail={detail} />
          </div>
        )}
      </main>
    </div>
  )
}

function BookingHistory({ detail }: { detail: ClientDetail }) {
  const items = [
    ...detail.consultations.map(c => ({
      id: c.id,
      kind: 'consultation' as const,
      starts_at: c.starts_at,
      label: 'Free consultation',
      status: c.status,
    })),
    ...detail.treatments.map(t => ({
      id: t.id,
      kind: 'treatment' as const,
      starts_at: t.starts_at,
      label: t.treatment.title,
      status: t.status,
    })),
  ].sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())

  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">No bookings yet.</p>
  }

  return (
    <div>
      <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
        Booking history
      </h3>
      <ul className="divide-y divide-sand-dark/40 rounded-sm border border-sand-dark/40">
        {items.map(item => (
          <li key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-ink">{item.label}</p>
              <p className="text-xs text-ink-muted">{formatAdminWhen(item.starts_at)}</p>
            </div>
            <span className="text-xs uppercase tracking-wide text-ink-faint">{item.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
