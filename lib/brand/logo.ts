import { getSiteUrl } from '@/lib/site/url'

/** Original logo — transparent background (dark text, for light/rose backgrounds). */
export const LOGO_DEFAULT = '/images/logo.png'

/** Light variant for dark footer. */
export const LOGO_LIGHT = '/images/logo-light.png'

/** Email header (240px, transparent). */
export const LOGO_EMAIL = '/images/logo-email.png'

export function getEmailLogoUrl(): string {
  return `${getSiteUrl()}${LOGO_EMAIL}`
}
