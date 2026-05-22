import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import type { Page } from '@/types/database'

export const getPage = unstable_cache(
  async (slug: string): Promise<Page> => {
    const supabase = createPublicClient()

    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !data) notFound()
    return data as Page
  },
  ['page'],
  { tags: ['pages'], revalidate: false },
)
