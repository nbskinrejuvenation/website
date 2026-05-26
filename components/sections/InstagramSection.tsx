import Link from 'next/link'
import Image from 'next/image'
import { Instagram } from 'lucide-react'
import { getInstagramGridSlots } from '@/lib/data/instagram-feed'
import type { SiteSettings } from '@/types/database'
import {
  DEFAULT_INSTAGRAM_URL,
  formatInstagramHandle,
  instagramHandleFromUrl,
  resolveInstagramUrl,
} from '@/lib/site/social'

export interface InstagramSectionProps {
  instagramUrl: string
  bookHref?: string
  bookLabel?: string
  eyebrow?: string
  heading?: string
  body?: string
  className?: string
}

const DEFAULT_COPY = {
  eyebrow: 'Special of the week',
  heading: 'Follow us on Instagram',
  body: 'To keep up to date with all our specials. There is a new one every week.',
  bookLabel: 'Book Now',
} as const

/** Reusable Instagram + weekly specials CTA block */
export async function InstagramSection({
  instagramUrl,
  bookHref = '/book',
  bookLabel = DEFAULT_COPY.bookLabel,
  eyebrow = DEFAULT_COPY.eyebrow,
  heading = DEFAULT_COPY.heading,
  body = DEFAULT_COPY.body,
  className = '',
}: InstagramSectionProps) {
  const resolvedUrl = resolveInstagramUrl(instagramUrl)
  const handleLabel = formatInstagramHandle(instagramHandleFromUrl(resolvedUrl))
  const slots = await getInstagramGridSlots()

  return (
    <section
      className={`border-y border-sand-dark/50 bg-gradient-to-br from-brand-50 via-cream to-brand-100/80 py-16 md:py-20 ${className}`}
      aria-labelledby="instagram-section-heading"
    >
      <div className="section-container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow mb-3">{eyebrow}</p>
            <h2 id="instagram-section-heading" className="section-heading">
              {heading}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">{body}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href={bookHref} className="btn-primary">
                {bookLabel}
              </Link>
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline inline-flex items-center justify-center gap-2"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                Follow on Instagram
              </a>
            </div>
          </div>

          <div className="group relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-1 rounded-sm bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] to-[#bc1888] opacity-40 blur-md transition-opacity group-hover:opacity-60" />
            <div className="relative grid grid-cols-3 gap-2 rounded-sm bg-white p-3 shadow-soft ring-1 ring-sand-dark/40">
              {slots.map((slot, i) => {
                const tile = (
                  <div className="relative aspect-square overflow-hidden rounded-sm bg-gradient-to-br from-brand-100 via-brand-50 to-cream transition-transform duration-300 group-hover:scale-[1.02]">
                    {slot.imageUrl ? (
                      <Image
                        src={slot.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 33vw, 200px"
                        unoptimized={slot.imageUrl.includes('cdninstagram.com')}
                      />
                    ) : null}
                  </div>
                )

                if (slot.permalink) {
                  return (
                    <a
                      key={slot.permalink}
                      href={slot.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View Instagram post"
                    >
                      {tile}
                    </a>
                  )
                }

                return <div key={i}>{tile}</div>
              })}
              <a
                href={resolvedUrl}
                className="absolute inset-0 flex items-center justify-center rounded-sm bg-ink/0 transition-colors hover:bg-ink/10"
                aria-label="View our Instagram for weekly specials"
              >
                <span className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-ink shadow-soft opacity-0 transition-opacity group-hover:opacity-100">
                  <Instagram className="h-4 w-4 text-[#E1306C]" aria-hidden="true" />
                  {handleLabel}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Build props from site settings with sensible defaults */
export function instagramSectionFromSettings(
  settings: SiteSettings,
  overrides?: Partial<InstagramSectionProps>,
): InstagramSectionProps {
  return {
    instagramUrl: resolveInstagramUrl(settings.instagram_url ?? DEFAULT_INSTAGRAM_URL),
    bookHref: settings.booking_url ?? '/book',
    ...overrides,
  }
}
