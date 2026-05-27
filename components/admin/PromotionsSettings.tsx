'use client'

import { useState } from 'react'
import type { PromoCode } from '@/types/database'
import { formatAudFromCents } from '@/lib/stripe/config'
import { cn } from '@/lib/utils/cn'

type PackageRow = {
  id: string
  treatment_id: string
  treatment_title: string
  label: string
  session_count: number
  price_cents: number
  active: boolean
}

interface TreatmentOption {
  id: string
  title: string
}

interface Props {
  initialPromos: PromoCode[]
  initialPackages: PackageRow[]
  treatments: TreatmentOption[]
}

export function PromotionsSettings({ initialPromos, initialPackages, treatments }: Props) {
  const [promos, setPromos] = useState(initialPromos)
  const [packages, setPackages] = useState(initialPackages)
  const [tab, setTab] = useState<'promo' | 'packages'>('promo')
  const [message, setMessage] = useState<string | null>(null)

  const [promoForm, setPromoForm] = useState({
    code: '',
    description: '',
    discount_type: 'percent' as 'percent' | 'fixed_cents',
    discount_value: '10',
    treatment_id: '',
    max_redemptions: '',
  })

  const [packageForm, setPackageForm] = useState({
    treatment_id: treatments[0]?.id ?? '',
    label: 'Pack of 3',
    session_count: '3',
    price_dollars: '',
  })

  const createPromo = async () => {
    setMessage(null)
    const discountValue = Number.parseInt(promoForm.discount_value, 10)
    if (!promoForm.code.trim() || !Number.isFinite(discountValue) || discountValue < 1) {
      setMessage('Enter a valid promo code and discount.')
      return
    }

    const res = await fetch('/api/admin/promo-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: promoForm.code,
        description: promoForm.description || undefined,
        discount_type: promoForm.discount_type,
        discount_value: discountValue,
        treatment_id: promoForm.treatment_id || null,
        max_redemptions: promoForm.max_redemptions
          ? Number.parseInt(promoForm.max_redemptions, 10)
          : null,
      }),
    })
    const json = (await res.json()) as { promo?: PromoCode; error?: string }
    if (!res.ok) {
      setMessage(json.error ?? 'Could not create promo code')
      return
    }
    if (json.promo) {
      setPromos(prev => [json.promo!, ...prev])
      setPromoForm({
        code: '',
        description: '',
        discount_type: 'percent',
        discount_value: '10',
        treatment_id: '',
        max_redemptions: '',
      })
      setMessage(`Created promo ${json.promo.code}.`)
    }
  }

  const togglePromo = async (id: string, active: boolean) => {
    const res = await fetch(`/api/admin/promo-codes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    const json = (await res.json()) as { promo?: PromoCode; error?: string }
    if (!res.ok || !json.promo) {
      setMessage(json.error ?? 'Update failed')
      return
    }
    setPromos(prev => prev.map(p => (p.id === id ? json.promo! : p)))
  }

  const createPackage = async () => {
    setMessage(null)
    const priceCents = Math.round(Number.parseFloat(packageForm.price_dollars) * 100)
    const sessionCount = Number.parseInt(packageForm.session_count, 10)
    if (!packageForm.treatment_id || !packageForm.label.trim() || !Number.isFinite(priceCents)) {
      setMessage('Fill in all package fields.')
      return
    }

    const res = await fetch('/api/admin/treatment-packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        treatment_id: packageForm.treatment_id,
        label: packageForm.label,
        session_count: sessionCount,
        price_cents: priceCents,
      }),
    })
    const json = (await res.json()) as {
      package?: PackageRow
      error?: string
    }
    if (!res.ok) {
      setMessage(json.error ?? 'Could not create package')
      return
    }
    if (json.package) {
      const t = treatments.find(x => x.id === json.package!.treatment_id)
      setPackages(prev => [
        {
          ...json.package!,
          treatment_title: t?.title ?? '',
        },
        ...prev,
      ])
      setPackageForm(f => ({ ...f, price_dollars: '', label: 'Pack of 3' }))
      setMessage('Package created.')
    }
  }

  const togglePackage = async (id: string, active: boolean) => {
    const res = await fetch(`/api/admin/treatment-packages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    const json = (await res.json()) as { package?: PackageRow; error?: string }
    if (!res.ok || !json.package) {
      setMessage(json.error ?? 'Update failed')
      return
    }
    setPackages(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              active: json.package!.active,
            }
          : p,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <TabButton active={tab === 'promo'} onClick={() => setTab('promo')}>
          Promo codes
        </TabButton>
        <TabButton active={tab === 'packages'} onClick={() => setTab('packages')}>
          Session packages
        </TabButton>
      </div>

      {message && (
        <p className="rounded-sm bg-brand-50 px-4 py-3 text-sm text-brand-900 ring-1 ring-brand-200">
          {message}
        </p>
      )}

      {tab === 'promo' && (
        <div className="space-y-6">
          <section className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40">
            <h2 className="font-display text-lg font-light text-ink">New promo code</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Clients enter this at checkout (single sessions only). Use for Instagram specials.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-ink">Code</span>
                <input
                  className="mt-1 w-full rounded-sm border border-sand-dark px-3 py-2"
                  value={promoForm.code}
                  onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="SUMMER20"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-ink">Description (optional)</span>
                <input
                  className="mt-1 w-full rounded-sm border border-sand-dark px-3 py-2"
                  value={promoForm.description}
                  onChange={e => setPromoForm(f => ({ ...f, description: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-ink">Discount type</span>
                <select
                  className="mt-1 w-full rounded-sm border border-sand-dark px-3 py-2"
                  value={promoForm.discount_type}
                  onChange={e =>
                    setPromoForm(f => ({
                      ...f,
                      discount_type: e.target.value as 'percent' | 'fixed_cents',
                    }))
                  }
                >
                  <option value="percent">Percent off</option>
                  <option value="fixed_cents">Fixed amount off (AUD)</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-ink">
                  {promoForm.discount_type === 'percent' ? 'Percent (1–100)' : 'Dollars off'}
                </span>
                <input
                  className="mt-1 w-full rounded-sm border border-sand-dark px-3 py-2"
                  value={promoForm.discount_value}
                  onChange={e => setPromoForm(f => ({ ...f, discount_value: e.target.value }))}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-ink">Treatment (optional)</span>
                <select
                  className="mt-1 w-full rounded-sm border border-sand-dark px-3 py-2"
                  value={promoForm.treatment_id}
                  onChange={e => setPromoForm(f => ({ ...f, treatment_id: e.target.value }))}
                >
                  <option value="">All treatments</option>
                  {treatments.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-ink">Max uses (optional)</span>
                <input
                  className="mt-1 w-full rounded-sm border border-sand-dark px-3 py-2"
                  value={promoForm.max_redemptions}
                  onChange={e => setPromoForm(f => ({ ...f, max_redemptions: e.target.value }))}
                  placeholder="Unlimited"
                />
              </label>
            </div>
            <button type="button" onClick={() => void createPromo()} className="btn-primary mt-4">
              Create promo code
            </button>
          </section>

          <section className="overflow-hidden rounded-sm bg-white shadow-card ring-1 ring-sand-dark/40">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-sand-dark/40 bg-cream-dark/50 text-xs uppercase tracking-widest text-ink-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Discount</th>
                  <th className="px-4 py-3 font-medium">Uses</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark/30">
                {promos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-ink-muted">
                      No promo codes yet.
                    </td>
                  </tr>
                ) : (
                  promos.map(p => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-medium text-ink">{p.code}</td>
                      <td className="px-4 py-3 text-ink-muted">
                        {p.discount_type === 'percent'
                          ? `${p.discount_value}%`
                          : formatAudFromCents(p.discount_value)}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {p.redemption_count}
                        {p.max_redemptions != null ? ` / ${p.max_redemptions}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void togglePromo(p.id, !p.active)}
                          className={cn(
                            'rounded-sm px-2 py-1 text-xs',
                            p.active
                              ? 'bg-green-50 text-green-800 ring-1 ring-green-200'
                              : 'bg-sand-dark/30 text-ink-muted',
                          )}
                        >
                          {p.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {tab === 'packages' && (
        <div className="space-y-6">
          <section className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40">
            <h2 className="font-display text-lg font-light text-ink">New session package</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Shown on the treatment booking page. First session is booked at purchase; remaining
              sessions are redeemed by email.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium text-ink">Treatment</span>
                <select
                  className="mt-1 w-full rounded-sm border border-sand-dark px-3 py-2"
                  value={packageForm.treatment_id}
                  onChange={e => setPackageForm(f => ({ ...f, treatment_id: e.target.value }))}
                >
                  {treatments.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-ink">Label</span>
                <input
                  className="mt-1 w-full rounded-sm border border-sand-dark px-3 py-2"
                  value={packageForm.label}
                  onChange={e => setPackageForm(f => ({ ...f, label: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-ink">Sessions</span>
                <input
                  type="number"
                  min={2}
                  className="mt-1 w-full rounded-sm border border-sand-dark px-3 py-2"
                  value={packageForm.session_count}
                  onChange={e => setPackageForm(f => ({ ...f, session_count: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-ink">Package price (AUD)</span>
                <input
                  className="mt-1 w-full rounded-sm border border-sand-dark px-3 py-2"
                  value={packageForm.price_dollars}
                  onChange={e => setPackageForm(f => ({ ...f, price_dollars: e.target.value }))}
                  placeholder="600"
                />
              </label>
            </div>
            <button type="button" onClick={() => void createPackage()} className="btn-primary mt-4">
              Create package
            </button>
          </section>

          <section className="overflow-hidden rounded-sm bg-white shadow-card ring-1 ring-sand-dark/40">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-sand-dark/40 bg-cream-dark/50 text-xs uppercase tracking-widest text-ink-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Treatment</th>
                  <th className="px-4 py-3 font-medium">Package</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark/30">
                {packages.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-ink-muted">{p.treatment_title}</td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {p.label} ({p.session_count} sessions)
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {formatAudFromCents(p.price_cents)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void togglePackage(p.id, !p.active)}
                        className={cn(
                          'rounded-sm px-2 py-1 text-xs',
                          p.active
                            ? 'bg-green-50 text-green-800 ring-1 ring-green-200'
                            : 'bg-sand-dark/30 text-ink-muted',
                        )}
                      >
                        {p.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-sm px-4 py-2 text-sm transition-colors',
        active
          ? 'bg-brand-600 text-cream'
          : 'bg-white text-ink-muted ring-1 ring-sand-dark/60 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
