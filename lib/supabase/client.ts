import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.generated'

/**
 * Browser-side Supabase client for use in Client Components.
 * Singleton pattern — one instance per browser session.
 *
 * Uses the anon key. RLS policies enforce access control.
 * Never import the admin client into a Client Component.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
