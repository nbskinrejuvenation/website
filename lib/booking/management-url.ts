import { getSiteUrl } from '@/lib/site/url'

export function getManageBookingUrl(managementToken: string): string {
  return `${getSiteUrl()}/manage/${managementToken}`
}
