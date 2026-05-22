import { createPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'
import type { SiteSettings } from '@/types/database'

/** Fallback used before the site_settings row is seeded in Supabase. */
const FALLBACK: SiteSettings = {
  id: 'fallback',
  business_name: 'Naturally Beautiful Skin Rejuvenation',
  phone: '0404 203 800',
  address: null,
  suburb: 'Dee Why',
  state: 'NSW',
  postcode: '2099',
  lat: null,
  lng: null,
  facebook_url: null,
  instagram_url: null,
  booking_url: null,
  updated_at: null,
}

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = createPublicClient()

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .maybeSingle()

    if (error) {
      console.warn(`getSiteSettings: ${error.message} — using fallback`)
      return FALLBACK
    }

    return (data as SiteSettings) ?? FALLBACK
  },
  ['site-settings'],
  { tags: ['site-settings'], revalidate: false },
)
