import Link from 'next/link'
import type { AdminDashboardStats } from '@/lib/data/admin-dashboard'
import { formatAdminWhen, formatAdminTime } from '@/lib/admin/datetime'
import { formatAudFromCents } from '@/lib/stripe/config'

interface Props {
  stats: AdminDashboardStats
}

export function DashboardView({ stats }: Props) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today" value={String(stats.todayAppointments)} hint="confirmed appointments" />
        <StatCard label="Next 7 days" value={String(stats.weekAppointments)} hint="confirmed" />
        <StatCard
          label="Awaiting payment"
          value={String(stats.pendingPayments)}
          hint="Stripe checkout in progress"
          alert={stats.pendingPayments > 0}
        />
        <StatCard
          label="Paid this week"
          value={formatAudFromCents(stats.weekRevenueCents)}
          hint="confirmed treatment bookings"
        />
      </div>

      {stats.nextAppointment && (
        <section className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40">
          <h2 className="text-xs font-medium uppercase tracking-widest text-ink-faint">Next up</h2>
          <p className="mt-2 font-display text-xl font-light text-ink">
            {stats.nextAppointment.clientName}
          </p>
          <p className="mt-1 text-ink-muted">{stats.nextAppointment.label}</p>
          <p className="mt-1 text-sm text-brand-600">
            {formatAdminWhen(stats.nextAppointment.starts_at)}
          </p>
          <Link
            href={`/admin/appointments?selected=${stats.nextAppointment.kind}-${stats.nextAppointment.id}`}
            className="btn-outline mt-4 inline-flex text-sm"
          >
            Open in appointments
          </Link>
        </section>
      )}

      <section className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-light text-ink">Today&apos;s schedule</h2>
          <Link href="/admin/calendar" className="text-sm text-brand-600 hover:underline">
            Week view
          </Link>
        </div>
        {stats.todayItems.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">No confirmed appointments today.</p>
        ) : (
          <ul className="mt-4 divide-y divide-sand-dark/40">
            {stats.todayItems.map(item => (
              <li key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-ink">{item.clientName}</p>
                  <p className="text-sm text-ink-muted">{item.label}</p>
                </div>
                <p className="shrink-0 text-sm text-brand-600">{formatAdminTime(item.starts_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/appointments" className="btn-primary">
          All appointments
        </Link>
        <Link href="/admin/clients" className="btn-outline">
          Client directory
        </Link>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  alert,
}: {
  label: string
  value: string
  hint: string
  alert?: boolean
}) {
  return (
    <div
      className={`rounded-sm bg-white p-5 shadow-card ring-1 ${
        alert ? 'ring-amber-400' : 'ring-sand-dark/40'
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">{label}</p>
      <p className="mt-2 font-display text-3xl font-light text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </div>
  )
}
