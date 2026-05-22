import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'
import { getPublicSupabaseEnv } from '@/lib/supabase/env'

/**
 * Stateless public Supabase client — no cookies, no session.
 *
 * Use this inside `unstable_cache()` wrappers. The cookie-based server
 * client cannot be used inside a cache scope because `cookies()` is a
 * dynamic data source.
 *
 * This client uses the anon key, so RLS still applies — it can only
 * read published rows, exactly as a site visitor would.
 */
export function createPublicClient() {
  const { url, anonKey } = getPublicSupabaseEnv()
  return createClient<Database>(url, anonKey)
}
