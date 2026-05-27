import { AvailabilityEditor } from '@/components/admin/AvailabilityEditor'
import { listAllAvailabilityRules } from '@/lib/data/availability-admin'

export default async function AdminAvailabilityPage() {
  const rules = await listAllAvailabilityRules()
  return <AvailabilityEditor initialRules={rules} />
}
