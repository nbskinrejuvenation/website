'use client'

import Image from 'next/image'
import type { Testimonial } from '@/types/database'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  testimonials: Testimonial[]
  eyebrow?: string
  heading?: string
}

export function TestimonialsSection({
  testimonials,
  eyebrow = 'See what',
  heading = 'Our clients say',
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  if (testimonials.length === 0) return null

  return (
    <section className="bg-cream-dark py-20 md:py-24" aria-labelledby="testimonials-heading">
      <div className="section-container">
        <p className="eyebrow mb-3 text-center">{eyebrow}</p>
        <h2 id="testimonials-heading" className="section-heading mb-14 text-center">
          {heading}
        </h2>

        <div className="relative px-6">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map(t => (
                <div
                  key={t.id}
                  className="min-w-0 flex-[0_0_100%] px-3 md:flex-[0_0_50%] lg:flex-[0_0_33.33%]"
                >
                  <blockquote className="flex h-full flex-col rounded-sm bg-white p-8 shadow-card ring-1 ring-sand-dark/40">
                    <p className="flex-1 font-display text-lg font-light italic leading-relaxed text-ink-muted">
                      &ldquo;{t.body}&rdquo;
                    </p>
                    <footer className="mt-8 flex items-center gap-4 border-t border-sand-dark/40 pt-6">
                      {t.avatar_url && (
                        <Image
                          src={t.avatar_url}
                          alt=""
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-ink">{t.client_name}</p>
                        {t.treatment_ref && (
                          <p className="text-xs text-ink-faint">
                            Treatment: {t.treatment_ref}
                          </p>
                        )}
                      </div>
                    </footer>
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute -left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2.5 shadow-soft ring-1 ring-sand-dark/40 transition-colors hover:bg-brand-50 md:left-0"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5 text-ink-muted" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute -right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2.5 shadow-soft ring-1 ring-sand-dark/40 transition-colors hover:bg-brand-50 md:right-0"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5 text-ink-muted" />
          </button>
        </div>
      </div>
    </section>
  )
}
