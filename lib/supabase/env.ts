const PLACEHOLDER_RE = /[<>]|project-ref|your-|example/i

function isValidSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.endsWith('.supabase.co') &&
      !PLACEHOLDER_RE.test(url)
    )
  } catch {
    return false
  }
}

/**
 * Validates public Supabase env vars before createClient runs.
 * Fails fast at build time with a clear message when Vercel env is missing.
 */
export function getPublicSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Vercel: Project → Settings → Environment Variables (enable Production, Preview, and Development).',
    )
  }

  if (!isValidSupabaseUrl(url)) {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL ("${url}"). ` +
        'Use the Project URL from Supabase Dashboard → Project Settings → API ' +
        '(e.g. https://your-project-ref.supabase.co). Do not use .env.example placeholders.',
    )
  }

  if (PLACEHOLDER_RE.test(anonKey)) {
    throw new Error(
      'Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY. Use the anon/public key from Supabase Dashboard → API.',
    )
  }

  return { url, anonKey }
}
