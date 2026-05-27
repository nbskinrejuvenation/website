'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { ContactSubmission } from '@/types/database'
import { formatAdminWhen } from '@/lib/admin/datetime'
import { cn } from '@/lib/utils/cn'

interface Props {
  initialSubmissions: ContactSubmission[]
  selectedId: string | null
  unreadOnly: boolean
}

export function ContactInbox({ initialSubmissions, selectedId, unreadOnly }: Props) {
  const router = useRouter()
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const selected = submissions.find(s => s.id === selectedId) ?? null

  useEffect(() => {
    setSubmissions(initialSubmissions)
  }, [initialSubmissions])

  useEffect(() => {
    setNotes(selected?.admin_notes ?? '')
    setMessage(null)
  }, [selected])

  const patch = async (id: string, body: { is_read?: boolean; admin_notes?: string | null }) => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = (await res.json()) as { submission?: ContactSubmission; error?: string }
      if (!res.ok) throw new Error(json.error ?? 'Update failed')
      if (json.submission) {
        setSubmissions(prev => prev.map(s => (s.id === id ? json.submission! : s)))
      }
      setMessage('Saved')
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-0 overflow-hidden rounded-sm bg-white shadow-card ring-1 ring-sand-dark/40 lg:grid-cols-5">
      <aside className="border-b border-sand-dark/40 lg:col-span-2 lg:border-b-0 lg:border-r">
        <div className="flex gap-2 border-b border-sand-dark/40 p-4">
          <a
            href="/admin/messages"
            className={cn(
              'rounded-sm px-3 py-1.5 text-xs font-medium uppercase tracking-wide',
              !unreadOnly ? 'bg-brand-500 text-cream' : 'border border-sand-dark text-ink-muted',
            )}
          >
            All
          </a>
          <a
            href="/admin/messages?filter=unread"
            className={cn(
              'rounded-sm px-3 py-1.5 text-xs font-medium uppercase tracking-wide',
              unreadOnly ? 'bg-brand-500 text-cream' : 'border border-sand-dark text-ink-muted',
            )}
          >
            Unread
          </a>
        </div>
        {submissions.length === 0 ? (
          <p className="p-8 text-sm text-ink-muted">No messages.</p>
        ) : (
          <ul className="max-h-[65vh] divide-y divide-sand-dark/40 overflow-y-auto">
            {submissions.map(s => (
              <li key={s.id}>
                <a
                  href={`/admin/messages?id=${s.id}${unreadOnly ? '&filter=unread' : ''}`}
                  className={cn(
                    'block px-5 py-4 transition-colors hover:bg-brand-50/50',
                    selectedId === s.id && 'bg-brand-50 ring-1 ring-inset ring-brand-200',
                    !s.is_read && 'border-l-2 border-l-brand-500',
                  )}
                >
                  <p className="font-medium text-ink">{s.full_name}</p>
                  <p className="mt-1 truncate text-sm text-ink-muted">{s.message ?? s.email}</p>
                  <p className="mt-2 text-xs text-ink-faint">{formatAdminWhen(s.created_at)}</p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className="bg-cream p-6 lg:col-span-3 lg:p-8">
        {!selected ? (
          <p className="text-sm text-ink-muted">Select a message</p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-light text-ink">{selected.full_name}</h2>
                <p className="mt-1 text-sm text-ink-muted">{formatAdminWhen(selected.created_at)}</p>
              </div>
              {!selected.is_read && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => patch(selected.id, { is_read: true })}
                  className="btn-outline text-sm disabled:opacity-50"
                >
                  Mark read
                </button>
              )}
            </div>

            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-widest text-ink-faint">Email</dt>
                <dd className="mt-1">
                  <a href={`mailto:${selected.email}`} className="text-brand-600 hover:underline">
                    {selected.email}
                  </a>
                </dd>
              </div>
              {selected.phone && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-ink-faint">Phone</dt>
                  <dd className="mt-1">
                    <a href={`tel:${selected.phone}`} className="text-brand-600 hover:underline">
                      {selected.phone}
                    </a>
                  </dd>
                </div>
              )}
              {selected.treatment_interest && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-ink-faint">Interest</dt>
                  <dd className="mt-1">{selected.treatment_interest}</dd>
                </div>
              )}
              {selected.message && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-ink-faint">Message</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-ink-muted">{selected.message}</dd>
                </div>
              )}
            </dl>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-ink-faint">
                Internal notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-sm border border-sand-dark px-4 py-2.5 text-sm"
              />
              <button
                type="button"
                disabled={saving}
                onClick={() => patch(selected.id, { admin_notes: notes || null })}
                className="btn-outline mt-3 disabled:opacity-50"
              >
                Save notes
              </button>
            </div>

            {message && <p className="text-sm text-brand-600">{message}</p>}
          </div>
        )}
      </main>
    </div>
  )
}
