import { ReportsView } from '@/components/admin/ReportsView'
import { getAdminReport, type ReportPeriod } from '@/lib/data/admin-reports'

interface Props {
  searchParams: Promise<{ period?: string }>
}

function parsePeriod(param?: string): ReportPeriod {
  if (param === '30d') return '30d'
  if (param === 'month') return 'month'
  return '7d'
}

export default async function AdminReportsPage({ searchParams }: Props) {
  const { period: periodParam } = await searchParams
  const period = parsePeriod(periodParam)
  const report = await getAdminReport(period)
  return <ReportsView report={report} period={period} />
}
