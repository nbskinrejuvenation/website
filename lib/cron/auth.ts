import type { NextRequest } from 'next/server'

/** Validates Vercel Cron or manual invocations (Bearer CRON_SECRET). */
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}
