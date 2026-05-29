/**
 * Google Maps Embed API — contact page map iframe.
 * @see docs/GOOGLE_MAPS_SETUP.md
 */

export function isGoogleMapsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim())
}

export function buildGoogleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function buildGoogleMapsEmbedUrl(input: {
  lat?: number | null
  lng?: number | null
  /** Used when lat/lng are missing */
  addressQuery?: string
  zoom?: number
}): string | null {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()
  if (!key) return null

  const zoom = input.zoom ?? 15
  const q =
    input.lat != null && input.lng != null
      ? `${input.lat},${input.lng}`
      : input.addressQuery?.trim()
        ? encodeURIComponent(input.addressQuery.trim())
        : null

  if (!q) return null

  return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${q}&zoom=${zoom}`
}
