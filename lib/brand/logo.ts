import { getSiteUrl } from '@/lib/site/url'

/** Crisp vector logo (transparent background). */
export const LOGO_SVG = '/images/logo.svg'

/** Light variant for dark header/footer backgrounds. */
export const LOGO_LIGHT_SVG = '/images/logo-light.svg'

/** Raster logo for email clients (generated at 2× from SVG). */
export const LOGO_EMAIL_PNG = '/images/logo-email.png'

export function getEmailLogoUrl(): string {
  return `${getSiteUrl()}${LOGO_EMAIL_PNG}`
}
