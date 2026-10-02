'use client'

import { useState } from 'react'
import type { TreatmentBookingSettings } from '@/lib/data/treatments-admin'
import { calculateChargeCents, formatAudFromCents } from '@/lib/stripe/config'
import { cn } from '@/lib/utils/cn'

interface Props {
  initialTreatments: TreatmentBookingSettings[]
  stripeConfigured: boolean
  /** STRIPE_DEPOSIT_PERCENT, used when a treatment's deposit is left blank. */
  defaultDepositPercent: number
}

type RowState = {
  priceDollars: string
  durationMinutes: string
  /** Blank = clinic default. */
  depositPercent: string
  bookableOnline: boolean
}

export function TreatmentsSettings({
  initialTreatments,
  stripeConfigured,
  defaultDepositPercent,
}: Props) {
  const [treatments, setTreatments] = useState(initialTreatments)
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      initialTreatments.map(t => [
        t.id,
        {
          priceDollars: String(
            t.price_cents != null ? t.price_cents / 100 : (t.price_from ?? 0),
          ),
          durationMinutes: String(t.duration_minutes ?? 60),
          depositPercent: t.deposit_percent != null ? String(t.deposit_percent) : '',
          bookableOnline: t.bookable_online ?? false,
        },
      ]),
    ),
  )
  const [savingId, setSavingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const updateRow = (id: string, patch: Partial<RowState>) => {
    setRows(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const save = async (id: string) => {
    const row = rows[id]
    const priceCents = Math.round(Number.parseFloat(row.priceDollars) * 100)
    const durationMinutes = Number.parseInt(row.durationMinutes, 10)
    const depositPercent = row.depositPercent.trim()
      ? Number.parseInt(row.depositPercent, 10)
      : null

    if (!Number.isFinite(priceCents) || priceCents < 50) {
      setMessage('Enter a valid price (minimum $0.50).')
      return
    }
    if (!Number.isFinite(durationMinutes) || durationMinutes < 15) {
      setMessage('Duration must be at least 15 minutes.')
      return
    }
    if (
      depositPercent != null &&
      (!Number.isFinite(depositPercent) || depositPercent < 1 || depositPercent > 100)
    ) {
      setMessage('Deposit must be between 1% and 100% (leave blank for the default).')
      return
    }

    setSavingId(id)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/treatments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price_cents: priceCents,
          duration_minutes: durationMinutes,
          bookable_online: stripeConfigured && row.bookableOnline,
          deposit_percent: depositPercent,
        }),
      })
      const json = (await res.json()) as { treatment?: TreatmentBookingSettings; error?: string }
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      if (json.treatment) {
        setTreatments(prev => prev.map(t => (t.id === id ? json.treatment! : t)))
        updateRow(id, {
          priceDollars: String((json.treatment.price_cents ?? 0) / 100),
          durationMinutes: String(json.treatment.duration_minutes),
          depositPercent:
            json.treatment.deposit_percent != null ? String(json.treatment.deposit_percent) : '',
          bookableOnline: json.treatment.bookable_online,
        })
      }
      setMessage(`Saved ${json.treatment?.title ?? 'treatment'}.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {!stripeConfigured && (
        <p className="rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          Stripe is not configured — &quot;Book &amp; pay online&quot; is disabled on the website until{' '}
          <code className="text-xs">STRIPE_SECRET_KEY</code> is set.
        </p>
      )}

      <div className="overflow-hidden rounded-sm bg-white shadow-card ring-1 ring-sand-dark/40">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-sand-dark/40 bg-cream-dark/50 text-xs uppercase tracking-widest text-ink-faint">
            <tr>
              <th className="px-4 py-3 font-medium">Treatment</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Online price</th>
              <th className="px-4 py-3 font-medium">Deposit</th>
              <th className="px-4 py-3 font-medium">Book online</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-dark/40">
            {treatments.map(t => {
              const row = rows[t.id]
              const previewCents = Math.round(Number.parseFloat(row.priceDollars || '0') * 100)
              const parsedPercent = Number.parseInt(row.depositPercent, 10)
              const effectivePercent =
                parsedPercent >= 1 && parsedPercent <= 100 ? parsedPercent : defaultDepositPercent
              return (
                <tr key={t.id} className={cn(!row.bookableOnline && 'opacity-70')}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{t.title}</p>
                    <p className="text-xs text-ink-faint">/services/{t.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={15}
                      max={240}
                      step={15}
                      value={row.durationMinutes}
                      onChange={e => updateRow(t.id, { durationMinutes: e.target.value })}
                      className="w-20 rounded-sm border border-sand-dark px-2 py-1.5"
                    />
                    <span className="ml-1 text-ink-muted">min</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-ink-muted">$</span>
                    <input
                      type="number"
                      min={0.5}
                      step={1}
                      value={row.priceDollars}
                      onChange={e => updateRow(t.id, { priceDollars: e.target.value })}
                      className="ml-1 w-24 rounded-sm border border-sand-dark px-2 py-1.5"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      step={5}
                      value={row.depositPercent}
                      placeholder={String(defaultDepositPercent)}
                      onChange={e => updateRow(t.id, { depositPercent: e.target.value })}
                      className="w-20 rounded-sm border border-sand-dark px-2 py-1.5"
                    />
                    <span className="ml-1 text-ink-muted">%</span>
                    {Number.isFinite(previewCents) && previewCents > 0 && (
                      <p className="mt-1 text-xs text-ink-faint">
                        Charges {formatAudFromCents(calculateChargeCents(previewCents, effectivePercent))}
                        {effectivePercent < 100 && ' online'}
                        {!row.depositPercent.trim() && ' (default)'}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={row.bookableOnline}
                      disabled={!stripeConfigured}
                      onChange={e => updateRow(t.id, { bookableOnline: e.target.checked })}
                      className="h-4 w-4 rounded border-sand-dark"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={savingId === t.id}
                      onClick={() => save(t.id)}
                      className="btn-outline text-xs disabled:opacity-50"
                    >
                      {savingId === t.id ? 'Saving…' : 'Save'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {message && <p className="text-sm text-brand-600">{message}</p>}
      <p className="text-xs text-ink-faint">
        Online price updates the &quot;from&quot; price shown on treatment pages. Deposit is the
        share of a session or package charged when booking online; the client pays the rest at the
        clinic. Leave it blank to use the clinic default ({defaultDepositPercent}%). Bookable price
        rows are edited under Prices. Slot length controls calendar availability for paid bookings.
      </p>
    </div>
  )
}
