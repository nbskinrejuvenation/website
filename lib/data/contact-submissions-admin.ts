import { createAdminClient } from '@/lib/supabase/admin'
import type { ContactSubmission } from '@/types/database'

export async function listContactSubmissions(filters?: {
  unreadOnly?: boolean
}): Promise<ContactSubmission[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  let query = supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (filters?.unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query
  if (error) throw new Error(`listContactSubmissions: ${error.message}`)
  return (data ?? []) as ContactSubmission[]
}

export async function updateContactSubmission(
  id: string,
  patch: { is_read?: boolean; admin_notes?: string | null },
): Promise<ContactSubmission> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('contact_submissions')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(`updateContactSubmission: ${error.message}`)
  return data as ContactSubmission
}

export async function getUnreadContactCount(): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { count, error } = await supabase
    .from('contact_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)

  if (error) throw new Error(`getUnreadContactCount: ${error.message}`)
  return count ?? 0
}
