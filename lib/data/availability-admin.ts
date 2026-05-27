import { createAdminClient } from '@/lib/supabase/admin'
import type { AvailabilityRule } from '@/types/database'

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function availabilityDayLabel(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek] ?? `Day ${dayOfWeek}`
}

export async function listAllAvailabilityRules(): Promise<AvailabilityRule[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { data, error } = await supabase
    .from('availability_rules')
    .select('*')
    .order('day_of_week', { ascending: true })

  if (error) throw new Error(`listAllAvailabilityRules: ${error.message}`)
  return (data ?? []) as AvailabilityRule[]
}

export async function upsertAvailabilityRule(input: {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}): Promise<AvailabilityRule> {
  if (input.day_of_week < 0 || input.day_of_week > 6) {
    throw new Error('day_of_week must be 0–6')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: existing } = await supabase
    .from('availability_rules')
    .select('id')
    .eq('day_of_week', input.day_of_week)
    .maybeSingle()

  const payload = {
    day_of_week: input.day_of_week,
    start_time: input.start_time,
    end_time: input.end_time,
    is_active: input.is_active,
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from('availability_rules')
      .update(payload)
      .eq('id', existing.id)
      .select('*')
      .single()
    if (error) throw new Error(`upsertAvailabilityRule: ${error.message}`)
    return data as AvailabilityRule
  }

  const { data, error } = await supabase
    .from('availability_rules')
    .insert(payload)
    .select('*')
    .single()

  if (error) throw new Error(`upsertAvailabilityRule: ${error.message}`)
  return data as AvailabilityRule
}
