'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="section-container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">
        Something went wrong
      </p>
      <h2 className="section-heading mb-4">We hit a snag</h2>
      <p className="mb-8 max-w-md text-neutral-500">
        An unexpected error occurred. Our team has been notified. Please try
        again or call us directly.
      </p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  )
}
