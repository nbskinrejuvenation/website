import Link from 'next/link'
import { Facebook, Instagram, Phone } from 'lucide-react'
import type { SiteSettings } from '@/types/database'

interface Props {
  settings: SiteSettings
}

export function Footer({ settings }: Props) {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-900 text-neutral-300">
      <div className="section-container py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand + social */}
          <div>
            <p className="mb-4 font-display text-lg text-white">
              {settings.business_name ?? 'Naturally Beautiful'}
            </p>
            <div className="flex gap-3">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                  className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" aria-hidden="true" />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" aria-hidden="true" />
                </a>
              )}
              {settings.phone && (
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`}
                  aria-label={`Call ${settings.phone}`}
                  className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Contact Us
            </h3>
            <address className="space-y-2 text-sm not-italic">
              {settings.phone && (
                <p>
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                    {settings.phone}
                  </a>
                </p>
              )}
              {(settings.address || settings.suburb) && (
                <p className="text-neutral-400">
                  {settings.address && <>{settings.address}<br /></>}
                  {settings.suburb}{settings.state ? `, ${settings.state}` : ''}{settings.postcode ? ` ${settings.postcode}` : ''}
                </p>
              )}
            </address>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm" role="list">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/services', label: 'All Treatments' },
                { href: '/specials', label: 'Specials' },
                { href: '/contact', label: 'Book Consultation' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-800 pt-6 text-center text-xs text-neutral-600">
          <p>© {new Date().getFullYear()} {settings.business_name ?? 'Naturally Beautiful Skin Rejuvenation'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
