/** Homepage hero media in /public */
export const HERO_VIDEO_URL = '/videos/hero.mp4'
export const HERO_POSTER_URL = '/images/hero-home.png'

/**
 * Compressed still for the <video poster> attribute. A poster is a plain URL and
 * never passes through next/image, so pointing it at hero-home.png made every
 * first visit download 2.0 MB before the video painted. Same dimensions, 263 KB.
 */
export const HERO_VIDEO_POSTER_URL = '/images/hero-home-poster.jpg'

/**
 * Clinic photographs to cross-fade in the hero. Populate this with the clinic's
 * own photography and it replaces the stock video automatically: HeroSection
 * prefers a slideshow whenever there are two or more entries.
 *
 * Requirements are in docs/HERO_MEDIA.md. In short: landscape, at least 1920px
 * wide, subject right of centre (the headline sits over the left third), and no
 * text burned into the image.
 */
export const HERO_IMAGE_URLS: string[] = []
