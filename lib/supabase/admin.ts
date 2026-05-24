import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'
import { getPublicSupabaseEnv, getServiceRoleKey } from '@/lib/supabase/env'

/**
 * Service-role Supabase client — bypasses ALL RLS policies.
 *
 * ⚠️  NEVER import this file from:
 *   - Any file in the `components/` directory
 *   - Any file with "use client" at the top
 *   - Any file that could be bundled into the client
 *
 * Safe to use in:
 *   - Route Handlers (app/api/[...]/route.ts)
 *   - Server Actions called from trusted contexts
 *   - MCP tool handlers
 *   - Database seed/migration scripts
 */

let adminClient: ReturnType<typeof createClient<Database>> | null = null

export function createAdminClient() {
  if (adminClient) return adminClient

  const { url } = getPublicSupabaseEnv()
  const serviceRoleKey = getServiceRoleKey()

  adminClient = createClient<Database>(
    url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )

  return adminClient
}
