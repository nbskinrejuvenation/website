/**
 * Canonical public site URL — used for emails, Stripe redirects, manage links, sitemap, OG tags.
 *
 * Set in `.env.local` (dev) and Vercel → Environment Variables (preview + production).
 *
 * Development:  https://website-iota-vert-23.vercel.app
 * Production:     https://nbskinrejuvenation.com.au
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nbskinrejuvenation.com.au'
).replace(/\/$/, '')

export function getSiteUrl(): string {
  return SITE_URL
}
