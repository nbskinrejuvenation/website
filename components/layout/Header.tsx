import Link from 'next/link'
import type { SiteSettings, TreatmentCard } from '@/types/database'
import { MobileMenu } from './MobileMenu'
import { NavDropdown } from './NavDropdown'
import { Phone } from 'lucide-react'

interface Props {
  settings: SiteSettings
  servicesByCategory: Record<string, TreatmentCard[]>
}

export function Header({ settings, servicesByCategory }: Props) {
  const faceServices = servicesByCategory['face'] ?? []
  const bodyServices = servicesByCategory['body'] ?? []

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <nav
        className="section-container flex h-16 items-center justify-between gap-4"
        aria-label="Main navigation"
      >
        {/* Logo / business name */}
        <Link href="/" className="flex-shrink-0 font-display text-lg text-neutral-800" aria-label="Naturally Beautiful — home">
          {settings.business_name ?? 'Naturally Beautiful'}
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex" role="list">
          <li>
            <Link href="/about" className="rounded px-3 py-2 text-sm font-medium text-neutral-600 hover:text-brand-500 transition-colors">
              About Us
            </Link>
          </li>
          {faceServices.length > 0 && (
            <li><NavDropdown label="Face" services={faceServices} /></li>
          )}
          {bodyServices.length > 0 && (
            <li><NavDropdown label="Body" services={bodyServices} /></li>
          )}
          <li>
            <Link href="/specials" className="rounded px-3 py-2 text-sm font-medium text-neutral-600 hover:text-brand-500 transition-colors">
              Specials
            </Link>
          </li>
          <li>
            <Link href="/contact" className="rounded px-3 py-2 text-sm font-medium text-neutral-600 hover:text-brand-500 transition-colors">
              Contact
            </Link>
          </li>
        </ul>

        {/* Phone CTA */}
        {settings.phone && (
          <a
            href={`tel:${settings.phone.replace(/\s/g, '')}`}
            className="hidden items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors md:flex"
            aria-label={`Call us on ${settings.phone}`}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {settings.phone}
          </a>
        )}

        <MobileMenu
          settings={settings}
          faceServices={faceServices}
          bodyServices={bodyServices}
        />
      </nav>
    </header>
  )
}
