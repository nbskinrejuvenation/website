'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown, Phone } from 'lucide-react'
import type { SiteSettings, TreatmentCard } from '@/types/database'
import { cn } from '@/lib/utils/cn'

interface Props {
  settings: SiteSettings
  faceServices: TreatmentCard[]
  bodyServices: TreatmentCard[]
}

export function MobileMenu({ settings, faceServices, bodyServices }: Props) {
  const [open, setOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const close = () => {
    setOpen(false)
    setExpandedCategory(null)
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="rounded-sm p-2 text-cream/95 transition-colors hover:text-brand-200"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      )}

      <div
        className={cn(
          'fixed inset-y-0 right-0 z-40 w-[min(100%,20rem)] bg-cream shadow-soft transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-[4.5rem] items-center justify-between border-b border-sand-dark/60 px-6">
          <span className="font-display text-lg font-light text-ink">Menu</span>
          <button onClick={close} className="text-ink-faint hover:text-brand-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="overflow-y-auto p-6">
          <ul className="space-y-1" role="list">
            <li>
              <Link
                href="/about"
                onClick={close}
                className="block py-2.5 text-sm font-medium text-ink-muted hover:text-brand-600"
              >
                About
              </Link>
            </li>
            <CategoryAccordion
              label="Face"
              services={faceServices}
              expanded={expandedCategory === 'face'}
              onToggle={() => setExpandedCategory(p => (p === 'face' ? null : 'face'))}
              onLinkClick={close}
            />
            <CategoryAccordion
              label="Body"
              services={bodyServices}
              expanded={expandedCategory === 'body'}
              onToggle={() => setExpandedCategory(p => (p === 'body' ? null : 'body'))}
              onLinkClick={close}
            />
            <li>
              <Link
                href="/specials"
                onClick={close}
                className="block py-2.5 text-sm font-medium text-ink-muted hover:text-brand-600"
              >
                Specials
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                onClick={close}
                className="block py-2.5 text-sm font-medium text-ink-muted hover:text-brand-600"
              >
                Contact
              </Link>
            </li>
          </ul>

          {settings.phone && (
            <div className="mt-8 border-t border-sand-dark/60 pt-6">
              <a
                href={`tel:${settings.phone.replace(/\s/g, '')}`}
                className="btn-phone w-full justify-center"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {settings.phone}
              </a>
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}

function CategoryAccordion({
  label,
  services,
  expanded,
  onToggle,
  onLinkClick,
}: {
  label: string
  services: TreatmentCard[]
  expanded: boolean
  onToggle: () => void
  onLinkClick: () => void
}) {
  return (
    <li>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2.5 text-sm font-medium text-ink-muted hover:text-brand-600"
        aria-expanded={expanded}
      >
        {label}
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {expanded && (
        <ul className="ml-3 space-y-1 border-l border-brand-200 pl-4" role="list">
          {services.map(service => (
            <li key={service.id}>
              <Link
                href={`/services/${service.slug}`}
                onClick={onLinkClick}
                className="block py-1.5 text-sm text-ink-faint hover:text-brand-600"
              >
                {service.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
