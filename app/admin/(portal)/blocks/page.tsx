import { ScheduleBlocksPanel } from '@/components/admin/ScheduleBlocksPanel'
import { listUpcomingScheduleBlocks } from '@/lib/data/schedule-blocks-admin'

export default async function AdminBlocksPage() {
  const blocks = await listUpcomingScheduleBlocks()
  return <ScheduleBlocksPanel initialBlocks={blocks} />
}
