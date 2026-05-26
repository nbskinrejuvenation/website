import { createPublicClient } from '@/lib/supabase/public'
import { CLINIC_ADDRESS_PARTS } from '@/lib/site/address'
import { DEFAULT_INSTAGRAM_URL, resolveInstagramUrl } from '@/lib/site/social'
import { unstable_cache } from 'next/cache'
import type { SiteSettings } from '@/types/database'

/** Fallback used before the site_settings row is seeded in Supabase. */
const FALLBACK: SiteSettings = {
  id: 'fallback',
  business_name: 'Naturally Beautiful Skin Rejuvenation',
  phone: '0404 203 800',
  address: CLINIC_ADDRESS_PARTS.address,
  suburb: CLINIC_ADDRESS_PARTS.suburb,
  state: CLINIC_ADDRESS_PARTS.state,
  postcode: CLINIC_ADDRESS_PARTS.postcode,
  lat: -33.7509,
  lng: 151.2863,
  facebook_url: null,
  instagram_url: DEFAULT_INSTAGRAM_URL,
  booking_url: '/book',
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

    const settings = (data as SiteSettings) ?? FALLBACK
    return {
      ...settings,
      instagram_url: resolveInstagramUrl(settings.instagram_url),
    }
  },
  ['site-settings-v2'],
  { tags: ['site-settings'], revalidate: 3600 },
)
