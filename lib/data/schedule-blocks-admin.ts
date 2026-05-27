import { createAdminClient } from '@/lib/supabase/admin'
import { buildScheduleBlockTimes } from '@/lib/booking/schedule-block-times'
import type { ScheduleBlock } from '@/types/database'

export async function listScheduleBlocksBetween(
  from: Date,
  to: Date,
): Promise<ScheduleBlock[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('schedule_blocks')
    .select('*')
    .lt('starts_at', to.toISOString())
    .gt('ends_at', from.toISOString())
    .order('starts_at', { ascending: true })

  if (error) throw new Error(`listScheduleBlocksBetween: ${error.message}`)
  return (data ?? []) as ScheduleBlock[]
}

export async function listUpcomingScheduleBlocks(limit = 40): Promise<ScheduleBlock[]> {
  const now = new Date()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('schedule_blocks')
    .select('*')
    .gte('ends_at', now.toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit)

  if (error) throw new Error(`listUpcomingScheduleBlocks: ${error.message}`)
  return (data ?? []) as ScheduleBlock[]
}

export async function createScheduleBlock(input: {
  date: string
  end_date?: string | null
  all_day: boolean
  start_time?: string
  end_time?: string
  title?: string | null
}): Promise<ScheduleBlock> {
  const { startsAt, endsAt } = buildScheduleBlockTimes(input)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('schedule_blocks')
    .insert({
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      title: input.title?.trim() || null,
    })
    .select('*')
    .single()

  if (error) throw new Error(`createScheduleBlock: ${error.message}`)
  return data as ScheduleBlock
}

export async function deleteScheduleBlock(id: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { error } = await supabase.from('schedule_blocks').delete().eq('id', id)
  if (error) throw new Error(`deleteScheduleBlock: ${error.message}`)
}
