/**
 * OpenStreetMap link for the contact page ("View larger map"). No API key needed.
 * The map itself is a static image: see scripts/generate-clinic-map.mjs.
 * @see docs/MAP_SETUP.md
 */

export function buildOpenStreetMapLinkUrl(lat: number, lng: number, zoom = 17): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`
}
