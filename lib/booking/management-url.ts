import { getSiteUrl } from '@/lib/email/resend'

export function getManageBookingUrl(managementToken: string): string {
  return `${getSiteUrl()}/manage/${managementToken}`
}
