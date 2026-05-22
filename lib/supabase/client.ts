import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.generated'
import { getPublicSupabaseEnv } from '@/lib/supabase/env'

/**
 * Browser-side Supabase client for use in Client Components.
 * Singleton pattern — one instance per browser session.
 *
 * Uses the anon key. RLS policies enforce access control.
 * Never import the admin client into a Client Component.
 */
export function createClient() {
  const { url, anonKey } = getPublicSupabaseEnv()
  return createBrowserClient<Database>(url, anonKey)
}
