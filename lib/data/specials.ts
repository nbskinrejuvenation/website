import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'
import type { Special } from '@/types/database'

export const getSpecials = unstable_cache(
  async (): Promise<Special[]> => {
    const supabase = createPublicClient()
    const now = new Date().toISOString().split('T')[0] // date only

    const { data, error } = await supabase
      .from('specials')
      .select('*')
      .eq('status', 'published')
      .or(`valid_to.is.null,valid_to.gte.${now}`)
      .order('id', { ascending: true })

    if (error) throw new Error(`getSpecials: ${error.message}`)
    return (data ?? []) as Special[]
  },
  ['specials'],
  { tags: ['specials'], revalidate: 3600 },
)
