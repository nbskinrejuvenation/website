import Link from 'next/link'
import type { AdminReportSummary, ReportPeriod } from '@/lib/data/admin-reports'
import { formatAdminWhen } from '@/lib/admin/datetime'
import { formatAudFromCents } from '@/lib/stripe/config'
import { cn } from '@/lib/utils/cn'

interface Props {
  report: AdminReportSummary
  period: ReportPeriod
}

const PERIODS: Array<{ key: ReportPeriod; label: string }> = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'month', label: 'This month' },
]

export function ReportsView({ report, period }: Props) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {PERIODS.map(p => (
          <Link
            key={p.key}
            href={`/admin/reports?period=${p.key}`}
            className={cn(
              'rounded-sm border px-3 py-1.5 text-sm',
              period === p.key
                ? 'border-brand-500 bg-brand-500 text-cream'
                : 'border-sand-dark text-ink-muted hover:border-brand-300',
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <p className="text-sm text-ink-muted">{report.range.label} (by appointment date, Sydney time)</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={formatAudFromCents(report.revenueCents)} />
        <Stat label="Paid treatments" value={String(report.treatmentCount)} />
        <Stat label="Consultations" value={String(report.consultationCount)} />
        <Stat label="Cancelled (paid)" value={String(report.cancelledCount)} />
      </div>

      <section className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40">
        <h2 className="font-display text-lg font-light text-ink">Paid treatment appointments</h2>
        {report.recentPaid.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">No confirmed paid bookings in this period.</p>
        ) : (
          <ul className="mt-4 divide-y divide-sand-dark/40">
            {report.recentPaid.map(row => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">{row.client_name}</p>
                  <p className="text-ink-muted">{row.treatment_title}</p>
                  <p className="text-xs text-ink-faint">{formatAdminWhen(row.starts_at)}</p>
                </div>
                <p className="font-medium text-brand-600">{formatAudFromCents(row.amount_cents)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-sm bg-white p-6 shadow-card ring-1 ring-sand-dark/40">
        <h2 className="font-display text-lg font-light text-ink">Export data</h2>
        <p className="mt-2 text-sm text-ink-muted">Download CSV for your accountant or records.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/api/admin/export/bookings" className="btn-outline text-sm">
            Download bookings
          </a>
          <a href="/api/admin/export/clients" className="btn-outline text-sm">
            Download clients
          </a>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-white p-5 shadow-card ring-1 ring-sand-dark/40">
      <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">{label}</p>
      <p className="mt-2 font-display text-2xl font-light text-ink">{value}</p>
    </div>
  )
}
