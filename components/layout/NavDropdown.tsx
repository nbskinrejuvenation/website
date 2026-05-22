'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { TreatmentCard } from '@/types/database'
import { cn } from '@/lib/utils/cn'

interface Props {
  label: string
  services: TreatmentCard[]
}

export function NavDropdown({ label, services }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={cn(
          'flex items-center gap-1 rounded px-3 py-2 text-sm font-medium transition-colors',
          open ? 'text-brand-600' : 'text-ink-muted hover:text-brand-600',
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 w-64 rounded-sm border border-sand-dark/60 bg-cream py-2 shadow-soft">
          {services.map(service => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="block px-4 py-2.5 text-sm text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-600"
              onClick={() => setOpen(false)}
            >
              {service.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
