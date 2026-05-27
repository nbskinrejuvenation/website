'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ScheduleBlock } from '@/types/database'
import { formatAdminWhen, formatAdminTime } from '@/lib/admin/datetime'
import { cn } from '@/lib/utils/cn'

interface Props {
  initialBlocks: ScheduleBlock[]
}

export function ScheduleBlocksPanel({ initialBlocks }: Props) {
  const router = useRouter()
  const [blocks, setBlocks] = useState(initialBlocks)
  const [allDay, setAllDay] = useState(true)
  const [date, setDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('12:00')
  const [endTime, setEndTime] = useState('13:00')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const formatBlockWhen = (block: ScheduleBlock) => {
    const start = new Date(block.starts_at)
    const end = new Date(block.ends_at)
    const sameDay =
      start.toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' }) ===
      end.toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' })
    const durationMs = end.getTime() - start.getTime()
    const allDayBlock = durationMs >= 23 * 60 * 60 * 1000

    if (allDayBlock && sameDay) {
      return formatAdminWhen(block.starts_at).replace(/,.*$/, '') + ' (all day)'
    }
    if (allDayBlock) {
      return `${formatAdminWhen(block.starts_at).split(',')[0]} – ${formatAdminWhen(block.ends_at).split(',')[0]} (all day)`
    }
    return `${formatAdminWhen(block.starts_at)} – ${formatAdminTime(block.ends_at)}`
  }

  const createBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) {
      setMessage('Choose a date.')
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/schedule-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          end_date: endDate.trim() || null,
          all_day: allDay,
          start_time: allDay ? undefined : startTime,
          end_time: allDay ? undefined : endTime,
          title: title.trim() || null,
        }),
      })
      const json = (await res.json()) as { block?: ScheduleBlock; error?: string }
      if (!res.ok) throw new Error(json.error ?? 'Failed to block time')
      if (json.block) {
        setBlocks(prev =>
          [...prev, json.block!].sort(
            (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
          ),
        )
      }
      setMessage('Time blocked — clients cannot book during this period.')
      setTitle('')
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to block time')
    } finally {
      setSaving(false)
    }
  }

  const removeBlock = async (id: string) => {
    setRemovingId(id)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/schedule-blocks/${id}`, { method: 'DELETE' })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(json.error ?? 'Failed to remove')
      setBlocks(prev => prev.filter(b => b.id !== id))
      setMessage('Block removed — times are bookable again.')
      router.refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to remove')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40">
        <h2 className="font-display text-lg font-light text-ink">Block time on the agenda</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Blocked periods are hidden from online booking (consultations and paid treatments). When
          Google Calendar is connected, blocks also appear on your clinic calendar. Existing
          appointments are not cancelled.
        </p>

        <form onSubmit={createBlock} className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={allDay}
                onChange={() => setAllDay(true)}
                className="h-4 w-4"
              />
              All day
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={!allDay}
                onChange={() => setAllDay(false)}
                className="h-4 w-4"
              />
              Specific times
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="text-sm">
              <span className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">From date</span>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="rounded-sm border border-sand-dark px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">
                To date (optional)
              </span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="rounded-sm border border-sand-dark px-3 py-2"
              />
            </label>
          </div>

          {!allDay && (
            <div className="flex flex-wrap gap-4">
              <label className="text-sm">
                <span className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">From</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="rounded-sm border border-sand-dark px-3 py-2"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">To</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="rounded-sm border border-sand-dark px-3 py-2"
                />
              </label>
            </div>
          )}

          <label className="block text-sm">
            <span className="mb-1 block text-xs uppercase tracking-widest text-ink-faint">
              Label (optional)
            </span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Lunch, Holiday, Training"
              className="w-full max-w-md rounded-sm border border-sand-dark px-3 py-2"
            />
          </label>

          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Blocking…' : 'Block time'}
          </button>
        </form>

        {message && (
          <p
            className={cn(
              'mt-4 text-sm',
              message.includes('Failed') || message.includes('Choose') ? 'text-red-600' : 'text-brand-600',
            )}
          >
            {message}
          </p>
        )}
      </section>

      <section className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40">
        <h2 className="text-xs font-medium uppercase tracking-widest text-ink-faint">Upcoming blocks</h2>
        {blocks.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">No blocked time coming up.</p>
        ) : (
          <ul className="mt-4 divide-y divide-sand-dark/40">
            {blocks.map(block => (
              <li key={block.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-ink">{block.title || 'Blocked'}</p>
                  <p className="text-sm text-ink-muted">{formatBlockWhen(block)}</p>
                </div>
                <button
                  type="button"
                  disabled={removingId === block.id}
                  onClick={() => removeBlock(block.id)}
                  className="shrink-0 text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  {removingId === block.id ? 'Removing…' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
