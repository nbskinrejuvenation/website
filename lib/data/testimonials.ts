import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'
import type { Testimonial } from '@/types/database'

/** Shown when Supabase has no featured testimonials yet */
export const FEATURED_TESTIMONIALS_FALLBACK: Testimonial[] = [
  {
    id: 'fallback-glaucia',
    client_name: 'Glaucia Huxley',
    body: "I'm very happy with the results and highly recommend the treatments I did. I have been receiving lots of complements about how beautiful my skin looks. I had tried many other clinics before, but never had the results I'm seeing now. I'm so glad I found Naturally Beautiful just around the corner from my place in Dee Why, simply the best skin clinic on the Northern Beaches.",
    treatment_ref: 'Micro needling & Fractional RF',
    avatar_url: null,
    is_featured: true,
    sort_order: 1,
    status: 'published',
  },
  {
    id: 'fallback-natalie',
    client_name: 'Natalie Violandi',
    body: 'Before seeing Lilian, my self-esteem was low and my face was covered in acne and acne scars. After my first microneedling session I already noticed a huge difference on my skin. The acne scars were not as noticeable as before and my skin looked healthier and glowing. My skin keeps improving every time I go for a new session. Not to mention Lilian is a lovely person, very knowledgeable and passionate about her work. Everything in her clinic is spotless.',
    treatment_ref: 'Micro needling',
    avatar_url: null,
    is_featured: true,
    sort_order: 2,
    status: 'published',
  },
]

export const getTestimonialsByPage = unstable_cache(
  async (_pageSlug: string): Promise<Testimonial[]> => {
    const supabase = createPublicClient()

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.warn(`getTestimonialsByPage: ${error.message} — using fallback`)
      return FEATURED_TESTIMONIALS_FALLBACK
    }

    const rows = (data ?? []) as Testimonial[]
    return rows.length > 0 ? rows : FEATURED_TESTIMONIALS_FALLBACK
  },
  ['testimonials-by-page'],
  { tags: ['testimonials'], revalidate: 60 },
)
