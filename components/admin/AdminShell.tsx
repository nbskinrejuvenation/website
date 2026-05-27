'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ADMIN_NAV, getAdminNavItem } from '@/lib/admin/nav'
import { cn } from '@/lib/utils/cn'

interface Props {
  children: React.ReactNode
}

export function AdminShell({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const navItem = getAdminNavItem(pathname)
  const title = navItem?.label ?? 'Clinic portal'
  const subtitle = navItem?.description

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cream-dark lg:flex">
      <aside className="border-b border-sand-dark/60 bg-brand-800 text-cream lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="px-5 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-200">
            Naturally Beautiful
          </p>
          <p className="mt-1 font-display text-lg font-light">Clinic portal</p>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:gap-0.5 lg:px-3 lg:pb-6">
          {ADMIN_NAV.map(item => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'shrink-0 rounded-sm px-3 py-2 text-sm transition-colors lg:px-3 lg:py-2.5',
                  active
                    ? 'bg-cream-dark font-medium text-ink'
                    : 'text-brand-100 hover:bg-brand-700/50 hover:text-cream',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden border-t border-brand-700/50 px-5 py-4 lg:mt-auto lg:block">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="block text-sm text-brand-100 hover:text-cream"
          >
            View website
          </a>
          <button
            type="button"
            onClick={logout}
            className="mt-3 w-full rounded-sm border border-cream/30 px-3 py-1.5 text-left text-sm hover:bg-cream/10"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-sand-dark/50 bg-cream px-5 py-4 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-light text-ink">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-brand-600 hover:underline"
              >
                Site
              </a>
              <button
                type="button"
                onClick={logout}
                className="rounded-sm border border-sand-dark px-3 py-1.5 text-sm text-ink-muted"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
