export type AdminNavId = 'dashboard' | 'appointments' | 'calendar' | 'clients'

export interface AdminNavItem {
  id: AdminNavId
  label: string
  href: string
  description?: string
}

export const ADMIN_NAV: AdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin', description: 'Overview' },
  {
    id: 'appointments',
    label: 'Appointments',
    href: '/admin/appointments',
    description: 'Consultations & paid treatments',
  },
  { id: 'calendar', label: 'Calendar', href: '/admin/calendar', description: 'Week view' },
  { id: 'clients', label: 'Clients', href: '/admin/clients', description: 'Client directory' },
]

export function getAdminNavItem(pathname: string): AdminNavItem | undefined {
  if (pathname === '/admin') return ADMIN_NAV[0]
  return ADMIN_NAV.find(item => item.href !== '/admin' && pathname.startsWith(item.href))
}
