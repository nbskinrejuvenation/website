import { DashboardView } from '@/components/admin/DashboardView'
import { getAdminDashboardStats } from '@/lib/data/admin-dashboard'

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats()
  return <DashboardView stats={stats} />
}
