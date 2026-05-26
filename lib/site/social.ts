/** Default social URLs (override via Supabase site_settings) */
export const INSTAGRAM_HANDLE = 'nb_skin_rejuv'

export const DEFAULT_INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`

/** Previous handle — rewrite if still stored in Supabase */
const LEGACY_INSTAGRAM_HANDLE = 'naturally_beautiful_skin_rejuv'

/** Always return the current Instagram URL (fixes stale DB + legacy handle). */
export function resolveInstagramUrl(url: string | null | undefined): string {
  const trimmed = url?.trim()
  if (!trimmed) return DEFAULT_INSTAGRAM_URL
  if (trimmed.includes(LEGACY_INSTAGRAM_HANDLE)) return DEFAULT_INSTAGRAM_URL
  return trimmed
}

/** Parse @handle from an instagram.com URL */
export function instagramHandleFromUrl(url: string): string {
  const match = url.match(/instagram\.com\/([^/?#]+)/i)
  return match?.[1] ?? INSTAGRAM_HANDLE
}

/** Display handle for UI, e.g. @nb_skin_rejuv */
export function formatInstagramHandle(handle: string = INSTAGRAM_HANDLE): string {
  return handle.startsWith('@') ? handle : `@${handle}`
}
