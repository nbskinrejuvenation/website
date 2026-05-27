'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface Props {
  token: string
  initialSubmitted: boolean
}

export function BookingIntakeForm({ token, initialSubmitted }: Props) {
  const [submitted, setSubmitted] = useState(initialSubmitted)
  const [open, setOpen] = useState(!initialSubmitted)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skinConcerns, setSkinConcerns] = useState('')
  const [medications, setMedications] = useState('')
  const [allergies, setAllergies] = useState('')
  const [notes, setNotes] = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/manage/${token}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skin_concerns: skinConcerns,
          medications,
          allergies,
          notes,
        }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error ?? 'Failed to save')
      setSubmitted(true)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (submitted && !open) {
    return (
      <section className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40">
        <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
          Pre-visit form
        </h2>
        <p className="mt-2 text-sm text-brand-600">Thank you — your intake form is on file.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 text-sm text-ink-muted underline hover:no-underline"
        >
          Update answers
        </button>
      </section>
    )
  }

  return (
    <section id="intake" className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40">
      <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">
        Pre-visit form
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        Help us prepare for your appointment — skin concerns, medications, and allergies.
      </p>
      <form onSubmit={save} className="mt-4 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">
            Skin concerns
          </span>
          <textarea
            value={skinConcerns}
            onChange={e => setSkinConcerns(e.target.value)}
            rows={3}
            className="w-full rounded-sm border border-sand-dark px-3 py-2"
            placeholder="e.g. pigmentation, ageing, acne scarring"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">
            Medications & supplements
          </span>
          <textarea
            value={medications}
            onChange={e => setMedications(e.target.value)}
            rows={2}
            className="w-full rounded-sm border border-sand-dark px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">
            Allergies
          </span>
          <textarea
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
            rows={2}
            className="w-full rounded-sm border border-sand-dark px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">
            Anything else
          </span>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-sm border border-sand-dark px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving…' : 'Submit intake form'}
        </button>
      </form>
    </section>
  )
}
