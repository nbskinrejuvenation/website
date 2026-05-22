'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'

/**
 * Shown at the top of every page in preview mode.
 * Provides a clear visual indicator and an exit button.
 */
export function PreviewBanner() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-amber-400 px-4 py-2 text-sm font-medium text-amber-950">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" aria-hidden="true" />
        <span>Preview mode — you are viewing unpublished content</span>
      </div>
      <Link
        href="/api/preview?disable=true"
        className="rounded border border-amber-700 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide hover:bg-amber-500 transition-colors"
      >
        Exit preview
      </Link>
    </div>
  )
}
