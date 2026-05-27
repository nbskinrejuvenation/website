import { createAdminClient } from '@/lib/supabase/admin'
import { buildScheduleBlockTimes } from '@/lib/booking/schedule-block-times'
import {
  createScheduleBlockCalendarEvent,
  deleteConsultationCalendarEvent,
} from '@/lib/google/calendar'
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

  const block = data as ScheduleBlock
  const durationMs = endsAt.getTime() - startsAt.getTime()
  const allDay = durationMs >= 23 * 60 * 60 * 1000

  try {
    const eventId = await createScheduleBlockCalendarEvent({
      title: input.title,
      startsAt,
      endsAt,
      allDay,
    })
    if (eventId) {
      const { data: synced, error: syncError } = await supabase
        .from('schedule_blocks')
        .update({ google_event_id: eventId })
        .eq('id', block.id)
        .select('*')
        .single()
      if (!syncError && synced) return synced as ScheduleBlock
    }
  } catch (err) {
    console.error('[createScheduleBlock] Google Calendar:', err)
  }

  return block
}

export async function deleteScheduleBlock(id: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: existing } = await supabase
    .from('schedule_blocks')
    .select('google_event_id')
    .eq('id', id)
    .maybeSingle()

  if (existing?.google_event_id) {
    try {
      await deleteConsultationCalendarEvent(existing.google_event_id)
    } catch (err) {
      console.error('[deleteScheduleBlock] Google Calendar:', err)
    }
  }

  const { error } = await supabase.from('schedule_blocks').delete().eq('id', id)
  if (error) throw new Error(`deleteScheduleBlock: ${error.message}`)
}
