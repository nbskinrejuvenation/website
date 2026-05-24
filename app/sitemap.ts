import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { SITE_URL } from '@/lib/seo/metadata'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient()

  const { data: treatments } = await supabase
    .from('treatments')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/specials`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/book`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  const servicePages: MetadataRoute.Sitemap = (treatments ?? []).map(t => ({
    url: `${SITE_URL}/services/${t.slug}`,
    lastModified: t.updated_at ? new Date(t.updated_at) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...servicePages]
}
