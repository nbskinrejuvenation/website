import { unstable_cache } from 'next/cache'
import { getInstagramPreviewImages } from '@/lib/images/instagram-preview'
import { fetchInstagramMedia, isInstagramGraphConfigured } from '@/lib/instagram/graph'

export interface InstagramGridSlot {
  imageUrl: string | null
  permalink: string | null
}

const SLOT_COUNT = 6

function slotsFromStaticFiles(): InstagramGridSlot[] {
  const files = getInstagramPreviewImages()
  return Array.from({ length: SLOT_COUNT }, (_, i) => {
    const imageUrl = files[i] ?? null
    return { imageUrl, permalink: null }
  })
}

const fetchCachedInstagramMedia = unstable_cache(
  async () => {
    if (!isInstagramGraphConfigured()) return []
    try {
      return await fetchInstagramMedia(SLOT_COUNT)
    } catch (err) {
      console.error('[instagram-feed]', err)
      return []
    }
  },
  ['instagram-feed-v1'],
  { revalidate: 3600, tags: ['instagram-feed'] },
)

/** Grid tiles: live Instagram when configured, else local files in public/images/instagram/. */
export async function getInstagramGridSlots(): Promise<InstagramGridSlot[]> {
  const fromApi = await fetchCachedInstagramMedia()

  if (fromApi.length > 0) {
    const slots: InstagramGridSlot[] = fromApi.slice(0, SLOT_COUNT).map(post => ({
      imageUrl: post.imageUrl,
      permalink: post.permalink,
    }))
    while (slots.length < SLOT_COUNT) {
      slots.push({ imageUrl: null, permalink: null })
    }
    return slots
  }

  return slotsFromStaticFiles()
}
