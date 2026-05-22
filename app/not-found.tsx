import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

/**
 * Global 404 handler.
 * Also handles database-driven redirects for changed slugs.
 */
export default async function NotFound() {
  return (
    <div className="section-container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">
        404
      </p>
      <h1 className="section-heading mb-4">Page not found</h1>
      <p className="mb-8 max-w-md text-neutral-500">
        The page you're looking for doesn't exist or may have moved. Try
        browsing our treatments below.
      </p>
      <div className="flex gap-4">
        <Link href="/" className="btn-primary">
          Go home
        </Link>
        <Link href="/services" className="btn-outline">
          View treatments
        </Link>
      </div>
    </div>
  )
}
