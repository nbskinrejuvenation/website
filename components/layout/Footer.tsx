import Link from 'next/link'
import { Facebook, Instagram, Phone } from 'lucide-react'
import type { SiteSettings } from '@/types/database'
import { Logo } from './Logo'

interface Props {
  settings: SiteSettings
}

export function Footer({ settings }: Props) {
  return (
    <footer className="border-t border-sand-dark/60 bg-ink text-cream/90">
      <div className="section-container py-14 md:py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="[&_span]:text-cream [&_span:last-child]:text-cream/50">
              <Logo />
            </div>
            <div className="mt-6 flex gap-3">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="rounded-full p-2 text-cream/50 transition-colors hover:bg-cream/10 hover:text-cream"
                >
                  <Facebook className="h-5 w-5" aria-hidden="true" />
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-full p-2 text-cream/50 transition-colors hover:bg-cream/10 hover:text-cream"
                >
                  <Instagram className="h-5 w-5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-cream/40">
              Contact
            </h3>
            <address className="space-y-2 text-sm not-italic">
              {settings.phone && (
                <p>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 transition-colors hover:text-cream"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {settings.phone}
                  </a>
                </p>
              )}
              {(settings.suburb || settings.address) && (
                <p className="text-cream/60">
                  {settings.address && (
                    <>
                      {settings.address}
                      <br />
                    </>
                  )}
                  {settings.suburb}
                  {settings.state ? `, ${settings.state}` : ''}
                  {settings.postcode ? ` ${settings.postcode}` : ''}
                </p>
              )}
            </address>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-cream/40">
              Explore
            </h3>
            <ul className="space-y-2 text-sm" role="list">
              {[
                { href: '/about', label: 'About us' },
                { href: '/services', label: 'Treatments' },
                { href: '/specials', label: 'Specials' },
                { href: '/contact', label: 'Book consultation' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-cream/70 transition-colors hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/10 pt-8 text-center text-xs text-cream/40">
          <p>
            © {new Date().getFullYear()}{' '}
            {settings.business_name ?? 'Naturally Beautiful Skin Rejuvenation'}
          </p>
        </div>
      </div>
    </footer>
  )
}
