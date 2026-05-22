import type { SiteSettings } from '@/types/database'

/** Default clinic address (matches live site + seed-site-settings.sql) */
export const CLINIC_ADDRESS_PARTS = {
  address: 'Shop 9–10, 8–12 Pacific Parade',
  suburb: 'Dee Why',
  state: 'NSW',
  postcode: '2099',
} as const

export const CLINIC_ADDRESS_FULL = formatFullAddress(CLINIC_ADDRESS_PARTS)

type AddressFields = Pick<SiteSettings, 'address' | 'suburb' | 'state' | 'postcode'>

/** Single-line address, e.g. Shop 9–10, 8–12 Pacific Parade, Dee Why, NSW 2099 */
export function formatFullAddress(settings: AddressFields): string {
  const street = settings.address?.trim()
  const locality = [settings.suburb, settings.state, settings.postcode]
    .filter(Boolean)
    .join(', ')

  if (street && locality) return `${street}, ${locality}`
  return street || locality || CLINIC_ADDRESS_FULL
}
