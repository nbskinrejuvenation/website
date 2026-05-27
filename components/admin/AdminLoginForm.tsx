'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export function AdminLoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/admin'

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Login failed')
      // Full navigation so the new httpOnly cookie is sent on the next request
      window.location.assign(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-950 px-4">
      <div className="w-full max-w-sm rounded-sm bg-cream p-8 shadow-soft ring-1 ring-sand-dark/40">
        <p className="eyebrow mb-2 text-brand-600">Clinic admin</p>
        <h1 className="font-display text-2xl font-light text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-ink-muted">Consultation bookings and client records</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-sm border border-sand-dark px-4 py-2.5 text-sm"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
