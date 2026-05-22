import { createPublicClient } from '@/lib/supabase/public'
import { withResolvedHeroImage } from '@/lib/images/treatment-hero'
import { unstable_cache } from 'next/cache'
import type { TreatmentCard } from '@/types/database'

/** Featured treatments for the homepage grid — all published, ordered by sort_order. */
export const getHomepageFeaturedServices = unstable_cache(
  async (): Promise<TreatmentCard[]> => {
    const supabase = createPublicClient()

    const { data, error } = await supabase
      .from('treatments')
      .select('id, slug, title, subtitle, hero_image, category, sort_order')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`getHomepageFeaturedServices: ${error.message}`)
    return ((data ?? []) as TreatmentCard[]).map(withResolvedHeroImage)
  },
  ['homepage-featured-services'],
  { tags: ['services', 'homepage'], revalidate: 60 },
)
