import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'
import type { Testimonial } from '@/types/database'

export const getTestimonialsByPage = unstable_cache(
  async (_pageSlug: string): Promise<Testimonial[]> => {
    const supabase = createPublicClient()

    // Current schema uses is_featured bool — all featured testimonials
    // show on all pages. The pageSlug param is kept for API compatibility
    // when a featured_on column is added later.
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`getTestimonialsByPage: ${error.message}`)
    return (data ?? []) as Testimonial[]
  },
  ['testimonials-by-page'],
  { tags: ['testimonials'], revalidate: false },
)
