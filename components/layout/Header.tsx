import Link from 'next/link'
import type { SiteSettings, TreatmentCard } from '@/types/database'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { NavDropdown } from './NavDropdown'
interface Props {
  settings: SiteSettings
  servicesByCategory: Record<string, TreatmentCard[]>
}

export function Header({ settings, servicesByCategory }: Props) {
  const faceServices = servicesByCategory['face'] ?? []
  const bodyServices = servicesByCategory['body'] ?? []

  return (
    <header className="sticky top-0 z-40 border-b-2 border-brand-500 bg-brand-600 shadow-[0_2px_20px_-4px_rgba(42,38,36,0.25)]">
      <nav
        className="section-container flex h-[4.5rem] items-center justify-between gap-4"
        aria-label="Main navigation"
      >
        <Logo variant="light" />

        <ul className="hidden items-center gap-0.5 md:flex" role="list">
          <li>
            <Link
              href="/about"
              className="rounded-sm px-3 py-2 text-sm font-medium text-cream/95 transition-colors hover:text-brand-200"
            >
              About
            </Link>
          </li>
          <li>
            {faceServices.length > 0 ? (
              <NavDropdown label="Face" services={faceServices} variant="light" />
            ) : (
              <Link
                href="/services#face"
                className="rounded-sm px-3 py-2 text-sm font-medium text-cream/95 transition-colors hover:text-brand-200"
              >
                Face
              </Link>
            )}
          </li>
          <li>
            {bodyServices.length > 0 ? (
              <NavDropdown label="Body" services={bodyServices} variant="light" />
            ) : (
              <Link
                href="/services#body"
                className="rounded-sm px-3 py-2 text-sm font-medium text-cream/95 transition-colors hover:text-brand-200"
              >
                Body
              </Link>
            )}
          </li>
          <li>
            <Link
              href="/specials"
              className="rounded-sm px-3 py-2 text-sm font-medium text-cream/95 transition-colors hover:text-brand-200"
            >
              Specials
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="rounded-sm px-3 py-2 text-sm font-medium text-cream/95 transition-colors hover:text-brand-200"
            >
              Contact
            </Link>
          </li>
        </ul>

        <Link
          href="/contact"
          className="btn-phone hidden !bg-cream !px-5 !py-2.5 !text-brand-600 hover:!bg-brand-50 md:inline-flex"
        >
          Book Appointment
        </Link>

        <MobileMenu
          settings={settings}
          faceServices={faceServices}
          bodyServices={bodyServices}
        />
      </nav>
    </header>
  )
}
