/** Supabase nested `client:clients(...)` may return an object or a single-element array. */
export function resolveNestedClient<T extends { full_name: string; email: string }>(
  client: T | T[] | null | undefined,
): T | null {
  if (!client) return null
  if (Array.isArray(client)) return client[0] ?? null
  return client
}
