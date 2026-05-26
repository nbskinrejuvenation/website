/** Default social URLs (override via Supabase site_settings) */
export const INSTAGRAM_HANDLE = 'nb_skin_rejuv'

export const DEFAULT_INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`

/** Display handle for UI, e.g. @nb_skin_rejuv */
export function formatInstagramHandle(handle: string = INSTAGRAM_HANDLE): string {
  return handle.startsWith('@') ? handle : `@${handle}`
}
