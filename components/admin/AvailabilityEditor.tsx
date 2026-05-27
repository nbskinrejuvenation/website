'use client'

import { useState } from 'react'
import { availabilityDayLabel } from '@/lib/data/availability-admin'
import type { AvailabilityRule } from '@/types/database'
import { cn } from '@/lib/utils/cn'

interface DayForm {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

function toForm(rules: AvailabilityRule[]): DayForm[] {
  const byDay = new Map(rules.map(r => [r.day_of_week, r]))
  return Array.from({ length: 7 }, (_, day) => {
    const rule = byDay.get(day)
    return {
      day_of_week: day,
      start_time: rule?.start_time.slice(0, 5) ?? '09:00',
      end_time: rule?.end_time.slice(0, 5) ?? '17:00',
      is_active: rule?.is_active ?? day !== 0,
    }
  })
}

interface Props {
  initialRules: AvailabilityRule[]
}

export function AvailabilityEditor({ initialRules }: Props) {
  const [days, setDays] = useState(() => toForm(initialRules))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const updateDay = (dayOfWeek: number, patch: Partial<DayForm>) => {
    setDays(prev => prev.map(d => (d.day_of_week === dayOfWeek ? { ...d, ...patch } : d)))
  }

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(days),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      setMessage('Clinic hours saved. Online booking will use these times immediately.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-sm bg-white shadow-card ring-1 ring-sand-dark/40">
      <p className="border-b border-sand-dark/40 px-6 py-4 text-sm text-ink-muted">
        Times are in <strong>Australia/Sydney</strong>. Closed days have no online slots. To block
        specific dates or hours (holidays, lunch), use{' '}
        <a href="/admin/blocks" className="text-brand-600 hover:underline">
          Time off
        </a>
        .
      </p>
      <ul className="divide-y divide-sand-dark/40">
        {days.map(day => (
          <li
            key={day.day_of_week}
            className={cn(
              'grid gap-4 px-6 py-4 sm:grid-cols-[140px_1fr_auto]',
              !day.is_active && 'bg-cream-dark/50 opacity-80',
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={day.is_active}
                onChange={e => updateDay(day.day_of_week, { is_active: e.target.checked })}
                className="h-4 w-4 rounded border-sand-dark"
              />
              <span className="font-medium text-ink">{availabilityDayLabel(day.day_of_week)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                From
                <input
                  type="time"
                  value={day.start_time}
                  disabled={!day.is_active}
                  onChange={e => updateDay(day.day_of_week, { start_time: e.target.value })}
                  className="rounded-sm border border-sand-dark px-2 py-1.5 text-ink disabled:opacity-50"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                To
                <input
                  type="time"
                  value={day.end_time}
                  disabled={!day.is_active}
                  onChange={e => updateDay(day.day_of_week, { end_time: e.target.value })}
                  className="rounded-sm border border-sand-dark px-2 py-1.5 text-ink disabled:opacity-50"
                />
              </label>
            </div>
            <span className="text-xs text-ink-faint sm:text-right">
              {day.is_active ? 'Open' : 'Closed'}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-sand-dark/40 px-6 py-4">
        <button type="button" onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving…' : 'Save clinic hours'}
        </button>
        {message && <p className="mt-3 text-sm text-brand-600">{message}</p>}
      </div>
    </div>
  )
}
