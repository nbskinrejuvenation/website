'use client'

import { useState } from 'react'
import type { TreatmentPriceOption } from '@/types/database'
import { calculateChargeCents, formatAudFromCents } from '@/lib/stripe/config'
import { cn } from '@/lib/utils/cn'

interface TreatmentChoice {
  id: string
  title: string
  slug: string
  /** Deposit charged online for this treatment (its own, else the clinic default). */
  depositPercent: number
}

interface Props {
  initialOptions: TreatmentPriceOption[]
  treatments: TreatmentChoice[]
}

type Draft = {
  group_name: string
  label: string
  priceDollars: string
  session_count: string
  subtitle: string
  sort_order: string
  active: boolean
}

const EMPTY_DRAFT: Draft = {
  group_name: 'Single sessions',
  label: '',
  priceDollars: '',
  session_count: '1',
  subtitle: '',
  sort_order: '0',
  active: true,
}

function toDraft(option: TreatmentPriceOption): Draft {
  return {
    group_name: option.group_name,
    label: option.label,
    priceDollars: String(option.price_cents / 100),
    session_count: String(option.session_count),
    subtitle: option.subtitle ?? '',
    sort_order: String(option.sort_order),
    active: option.active,
  }
}

/** Validated request body, or an error message. */
function toPayload(draft: Draft): { body: Record<string, unknown> } | { error: string } {
  const priceCents = Math.round(Number.parseFloat(draft.priceDollars) * 100)
  const sessionCount = Number.parseInt(draft.session_count, 10)
  const sortOrder = Number.parseInt(draft.sort_order, 10)
  if (draft.group_name.trim().length < 2) return { error: 'Enter a heading, e.g. "Single sessions" or "Pack of 3".' }
  if (!draft.label.trim()) return { error: 'Enter a label, e.g. "Full face".' }
  if (!Number.isFinite(priceCents) || priceCents < 100) return { error: 'Price must be at least $1.' }
  if (!Number.isFinite(sessionCount) || sessionCount < 1 || sessionCount > 20) {
    return { error: 'Sessions must be between 1 and 20.' }
  }
  return {
    body: {
      group_name: draft.group_name.trim(),
      label: draft.label.trim(),
      price_cents: priceCents,
      session_count: sessionCount,
      subtitle: draft.subtitle.trim() || null,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      active: draft.active,
    },
  }
}

export function PriceOptionsSettings({ initialOptions, treatments }: Props) {
  const [options, setOptions] = useState(initialOptions)
  const [treatmentId, setTreatmentId] = useState(treatments[0]?.id ?? '')
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(initialOptions.map(o => [o.id, toDraft(o)])),
  )
  const [newDraft, setNewDraft] = useState<Draft>(EMPTY_DRAFT)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const treatment = treatments.find(t => t.id === treatmentId)
  const rows = options
    .filter(o => o.treatment_id === treatmentId)
    .sort((a, b) => a.sort_order - b.sort_order)

  const updateDraft = (id: string, patch: Partial<Draft>) => {
    setDrafts(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const save = async (id: string) => {
    const payload = toPayload(drafts[id])
    if ('error' in payload) {
      setMessage(payload.error)
      return
    }
    setBusyId(id)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/price-options/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.body),
      })
      const json = (await res.json()) as { option?: TreatmentPriceOption; error?: string }
      if (!res.ok || !json.option) throw new Error(json.error ?? 'Save failed')
      setOptions(prev => prev.map(o => (o.id === id ? json.option! : o)))
      updateDraft(id, toDraft(json.option))
      setMessage(`Saved ${json.option.label}.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: string) => {
    setBusyId(id)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/price-options/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setOptions(prev => prev.filter(o => o.id !== id))
      setMessage('Row deleted.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusyId(null)
    }
  }

  const add = async () => {
    const payload = toPayload(newDraft)
    if ('error' in payload) {
      setMessage(payload.error)
      return
    }
    setBusyId('new')
    setMessage(null)
    try {
      const res = await fetch('/api/admin/price-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload.body, treatment_id: treatmentId }),
      })
      const json = (await res.json()) as { option?: TreatmentPriceOption; error?: string }
      if (!res.ok || !json.option) throw new Error(json.error ?? 'Create failed')
      setOptions(prev => [...prev, json.option!])
      setDrafts(prev => ({ ...prev, [json.option!.id]: toDraft(json.option!) }))
      setNewDraft({ ...EMPTY_DRAFT, group_name: newDraft.group_name, session_count: newDraft.session_count })
      setMessage(`Added ${json.option.label}.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setBusyId(null)
    }
  }

  const depositNote = (draft: Draft) => {
    const cents = Math.round(Number.parseFloat(draft.priceDollars || '0') * 100)
    if (!treatment || !Number.isFinite(cents) || cents < 100) return null
    return `${formatAudFromCents(calculateChargeCents(cents, treatment.depositPercent))} online`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-ink" htmlFor="price-treatment">
          Treatment
        </label>
        <select
          id="price-treatment"
          value={treatmentId}
          onChange={e => setTreatmentId(e.target.value)}
          className="rounded-sm border border-sand-dark bg-white px-3 py-2 text-sm"
        >
          {treatments.map(t => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        {treatment && (
          <a
            href={`/services/${treatment.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brand-600 hover:underline"
          >
            View page
          </a>
        )}
      </div>

      <div className="overflow-x-auto rounded-sm bg-white shadow-card ring-1 ring-sand-dark/40">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-sand-dark/40 bg-cream-dark/50 text-xs uppercase tracking-widest text-ink-faint">
            <tr>
              <th className="px-3 py-3 font-medium">Heading</th>
              <th className="px-3 py-3 font-medium">Label</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Sessions</th>
              <th className="px-3 py-3 font-medium">Note</th>
              <th className="px-3 py-3 font-medium">Order</th>
              <th className="px-3 py-3 font-medium">Shown</th>
              <th className="px-3 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-dark/40">
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-ink-muted">
                  No price rows yet. Until one is added, the page shows its old price list without
                  Book buttons.
                </td>
              </tr>
            )}
            {rows.map(o => {
              const draft = drafts[o.id]
              return (
                <tr key={o.id} className={cn(!draft.active && 'opacity-60')}>
                  <DraftCells draft={draft} onChange={patch => updateDraft(o.id, patch)} depositNote={depositNote(draft)} />
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => save(o.id)}
                      className="btn-outline text-xs disabled:opacity-50"
                    >
                      {busyId === o.id ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => remove(o.id)}
                      className="ml-2 text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
            <tr className="bg-cream/60">
              <DraftCells draft={newDraft} onChange={patch => setNewDraft(prev => ({ ...prev, ...patch }))} depositNote={depositNote(newDraft)} />
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  disabled={busyId === 'new' || !treatmentId}
                  onClick={add}
                  className="btn-primary text-xs disabled:opacity-50"
                >
                  {busyId === 'new' ? 'Adding…' : 'Add row'}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {message && <p className="text-sm text-brand-600">{message}</p>}
      <p className="text-xs text-ink-faint">
        Each row shows on the treatment page with a Book button for that exact price. Booking
        charges the treatment&apos;s deposit ({treatment?.depositPercent ?? 10}%) online and the
        balance is paid at the clinic. Rows with more than one session are packs: promo codes
        don&apos;t apply to them. Untick &quot;Shown&quot; to hide a row without deleting it. Book
        buttons only appear when the treatment has &quot;Book online&quot; ticked under Treatments.
      </p>
    </div>
  )
}

function DraftCells({
  draft,
  onChange,
  depositNote,
}: {
  draft: Draft
  onChange: (patch: Partial<Draft>) => void
  depositNote: string | null
}) {
  const input = 'rounded-sm border border-sand-dark px-2 py-1.5'
  return (
    <>
      <td className="px-3 py-2">
        <input value={draft.group_name} onChange={e => onChange({ group_name: e.target.value })} className={cn(input, 'w-36')} />
      </td>
      <td className="px-3 py-2">
        <input value={draft.label} onChange={e => onChange({ label: e.target.value })} className={cn(input, 'w-48')} placeholder="Full face" />
      </td>
      <td className="whitespace-nowrap px-3 py-2">
        <span className="text-ink-muted">$</span>
        <input
          type="number"
          min={1}
          step={1}
          value={draft.priceDollars}
          onChange={e => onChange({ priceDollars: e.target.value })}
          className={cn(input, 'ml-1 w-24')}
        />
        {depositNote && <p className="mt-1 text-xs text-ink-faint">Charges {depositNote}</p>}
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          min={1}
          max={20}
          value={draft.session_count}
          onChange={e => onChange({ session_count: e.target.value })}
          className={cn(input, 'w-16')}
        />
      </td>
      <td className="px-3 py-2">
        <input value={draft.subtitle} onChange={e => onChange({ subtitle: e.target.value })} className={cn(input, 'w-48')} placeholder="One session" />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={draft.sort_order}
          onChange={e => onChange({ sort_order: e.target.value })}
          className={cn(input, 'w-16')}
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="checkbox"
          checked={draft.active}
          onChange={e => onChange({ active: e.target.checked })}
          className="h-4 w-4 rounded border-sand-dark"
        />
      </td>
    </>
  )
}
