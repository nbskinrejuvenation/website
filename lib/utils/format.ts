/**
 * Formatting utilities shared across the app.
 */

/** Format cents to AUD display string. e.g. 14000 → "$140" */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

/** Format a "from $X" price */
export function formatFromPrice(cents: number): string {
  return `From ${formatPrice(cents)}`
}

/** Format savings e.g. 840 → "Save $8" */
export function formatSavings(cents: number, isFrom = false): string {
  const amount = formatPrice(cents)
  return isFrom ? `Save from ${amount}` : `Save ${amount}`
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + '…'
}

/** Convert a slug to a title-cased display string */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Strip trailing slash from a URL path */
export function normalizePathname(pathname: string): string {
  return pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname
}
