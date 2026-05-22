import Link from 'next/link'
import type { SiteSettings, TreatmentCard } from '@/types/database'
import { Logo } from './Logo'
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
    <header className="sticky top-0 z-40 border-b border-sand-dark/50 bg-cream/90 backdrop-blur-md">
      <nav
        className="section-container flex h-[4.5rem] items-center justify-between gap-4"
        aria-label="Main navigation"
      >
        <Logo />

        <ul className="hidden items-center gap-0.5 md:flex" role="list">
          <li>
            <Link
              href="/about"
              className="rounded-sm px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-brand-600"
            >
              About
            </Link>
          </li>
          <li>
            {faceServices.length > 0 ? (
              <NavDropdown label="Face" services={faceServices} />
            ) : (
              <Link
                href="/services#face"
                className="rounded-sm px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-brand-600"
              >
                Face
              </Link>
            )}
          </li>
          <li>
            {bodyServices.length > 0 ? (
              <NavDropdown label="Body" services={bodyServices} />
            ) : (
              <Link
                href="/services#body"
                className="rounded-sm px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-brand-600"
              >
                Body
              </Link>
            )}
          </li>
          <li>
            <Link
              href="/specials"
              className="rounded-sm px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-brand-600"
            >
              Specials
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="rounded-sm px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-brand-600"
            >
              Contact
            </Link>
          </li>
        </ul>

        {settings.phone && (
          <a
            href={`tel:${settings.phone.replace(/\s/g, '')}`}
            className="btn-phone hidden !px-5 !py-2.5 md:inline-flex"
            aria-label={`Call us on ${settings.phone}`}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span className="hidden lg:inline">{settings.phone}</span>
            <span className="lg:hidden">Call</span>
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
