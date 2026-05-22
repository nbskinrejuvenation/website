import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'
import type { Treatment, TreatmentCard } from '@/types/database'

/** All published treatments — used for nav, index page, sitemap, generateStaticParams. */
export const getAllServices = unstable_cache(
  async (): Promise<TreatmentCard[]> => {
    const supabase = createPublicClient()

    const { data, error } = await supabase
      .from('treatments')
      .select('id, slug, title, subtitle, hero_image, category, sort_order')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`getAllServices: ${error.message}`)
    return (data ?? []) as TreatmentCard[]
  },
  ['all-services'],
  { tags: ['services'], revalidate: 60 },
)

/** Single published treatment by slug — used in /services/[slug]. */
export const getServiceBySlug = unstable_cache(
  async (slug: string): Promise<Treatment | null> => {
    const supabase = createPublicClient()

    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`getServiceBySlug(${slug}): ${error.message}`)
    }

    return data as Treatment
  },
  ['service-by-slug'],
  { tags: ['services'], revalidate: 60 },
)

/** Preview variant — fetches draft + published. Not cached. */
export async function getServiceBySlugPreview(slug: string): Promise<Treatment | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getServiceBySlugPreview(${slug}): ${error.message}`)
  }
  return data as Treatment
}

/** Treatments grouped by category — used for nav dropdowns. */
export const getServicesByCategory = unstable_cache(
  async (): Promise<Record<string, TreatmentCard[]>> => {
    const treatments = await getAllServices()
    return treatments.reduce<Record<string, TreatmentCard[]>>((acc, t) => {
      if (!acc[t.category]) acc[t.category] = []
      acc[t.category].push(t)
      return acc
    }, {})
  },
  ['services-by-category'],
  { tags: ['services'], revalidate: 60 },
)

/** All published slugs for generateStaticParams. */
export async function getAllServiceSlugs(): Promise<string[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('treatments')
    .select('slug')
    .eq('status', 'published')

  return (data ?? []).map(t => t.slug)
}
