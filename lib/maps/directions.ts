/**
 * "Get directions" links for the contact page. No API keys: each opens the
 * visitor's own maps app (or its website on desktop).
 * @see docs/MAP_SETUP.md
 */

export interface DirectionsTarget {
  /** Full street address, used by Google Maps so it resolves the business listing. */
  address: string
  lat?: number | null
  lng?: number | null
}

export function buildGoogleDirectionsUrl({ address }: DirectionsTarget): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}

export function buildAppleDirectionsUrl({ address, lat, lng }: DirectionsTarget): string {
  const destination = lat != null && lng != null ? `${lat},${lng}` : address
  return `https://maps.apple.com/?daddr=${encodeURIComponent(destination)}&q=${encodeURIComponent(address)}`
}

export function buildWazeDirectionsUrl({ address, lat, lng }: DirectionsTarget): string {
  return lat != null && lng != null
    ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`
}
