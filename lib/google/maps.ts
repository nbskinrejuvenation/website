/**
 * Google Maps links (directions / search). No API key needed.
 * The contact page map is a static image with directions links: see lib/maps/directions.ts.
 */

export function buildGoogleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
