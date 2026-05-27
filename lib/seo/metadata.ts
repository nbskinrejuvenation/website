import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site/url'

export { SITE_URL }

/** Default social share image (homepage hero) */
export const DEFAULT_OG_IMAGE = '/images/hero-home.png'

export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = SITE_URL.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/** Short page title — composed with layout template `%s | {business name}` */
export function pageTitle(shortTitle: string): string {
  return shortTitle
}

/** Full title when the string already includes the brand (e.g. homepage) */
export function absoluteTitle(fullTitle: string): Metadata['title'] {
  return { absolute: fullTitle }
}

export function buildOpenGraphImages(imagePath?: string | null) {
  const url = absoluteUrl(imagePath?.trim() || DEFAULT_OG_IMAGE)
  return [
    {
      url,
      width: 1200,
      height: 630,
      alt: 'Naturally Beautiful Skin Rejuvenation',
    },
  ]
}

export function openGraphDefaults(
  title: string,
  description: string,
  imagePath?: string | null,
  path = '/',
): Metadata['openGraph'] {
  return {
    title,
    description,
    url: absoluteUrl(path),
    siteName: 'Naturally Beautiful Skin Rejuvenation',
    locale: 'en_AU',
    type: 'website',
    images: buildOpenGraphImages(imagePath),
  }
}
