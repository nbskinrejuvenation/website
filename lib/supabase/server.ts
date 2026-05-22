import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.generated'
import { getPublicSupabaseEnv } from '@/lib/supabase/env'

/**
 * Server-side Supabase client for use in:
 * - React Server Components
 * - Route Handlers
 * - Server Actions
 *
 * Uses the anon key. RLS policies enforce read-only access to published content.
 * For writes or bypass of RLS, use the admin client instead.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getPublicSupabaseEnv()

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            })
          } catch {
            // setAll called from a Server Component — safe to ignore.
            // The middleware will handle session refresh.
          }
        },
      },
    },
  )
}
