const GRAPH_API_VERSION = 'v21.0'

export interface InstagramGraphMedia {
  id: string
  imageUrl: string
  permalink: string
}

interface GraphMediaNode {
  id: string
  media_type?: string
  media_url?: string
  thumbnail_url?: string
  permalink?: string
  children?: { data?: Array<{ media_type?: string; media_url?: string }> }
}

function imageUrlFromNode(node: GraphMediaNode): string | null {
  if (node.media_type === 'VIDEO') {
    return node.thumbnail_url ?? null
  }
  if (node.media_type === 'CAROUSEL_ALBUM') {
    const child = node.children?.data?.find(c => c.media_url)
    return child?.media_url ?? null
  }
  return node.media_url ?? node.thumbnail_url ?? null
}

export function isInstagramGraphConfigured(): boolean {
  return Boolean(
    process.env.INSTAGRAM_ACCESS_TOKEN?.trim() && process.env.INSTAGRAM_USER_ID?.trim(),
  )
}

/** Latest posts from Instagram Graph API (Business/Creator account required). */
export async function fetchInstagramMedia(limit = 6): Promise<InstagramGraphMedia[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim()
  const userId = process.env.INSTAGRAM_USER_ID?.trim()
  if (!token || !userId) {
    throw new Error('INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID are required')
  }

  const fields = [
    'id',
    'media_type',
    'media_url',
    'thumbnail_url',
    'permalink',
    'children{media_type,media_url}',
  ].join(',')

  const url = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${userId}/media`)
  url.searchParams.set('fields', fields)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('access_token', token)

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Instagram Graph API error: ${text}`)
  }

  const json = (await res.json()) as { data?: GraphMediaNode[] }
  const items: InstagramGraphMedia[] = []

  for (const node of json.data ?? []) {
    const imageUrl = imageUrlFromNode(node)
    if (!imageUrl || !node.permalink) continue
    items.push({
      id: node.id,
      imageUrl,
      permalink: node.permalink,
    })
  }

  return items
}
