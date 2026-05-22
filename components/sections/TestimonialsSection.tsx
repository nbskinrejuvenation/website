'use client'

import Image from 'next/image'
import type { Testimonial } from '@/types/database'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  testimonials: Testimonial[]
  heading?: string
}

export function TestimonialsSection({ testimonials, heading = 'What our clients say' }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  if (testimonials.length === 0) return null

  return (
    <section className="bg-neutral-50 py-20" aria-labelledby="testimonials-heading">
      <div className="section-container">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-brand-500">See what</p>
        <h2 id="testimonials-heading" className="section-heading mb-12 text-center">{heading}</h2>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map(t => (
                <div key={t.id} className="min-w-0 flex-[0_0_100%] px-4 md:flex-[0_0_50%] lg:flex-[0_0_33.33%]">
                  <blockquote className="flex h-full flex-col bg-white p-8 shadow-sm ring-1 ring-neutral-100">
                    <p className="flex-1 text-sm leading-relaxed text-neutral-600">"{t.body}"</p>
                    <footer className="mt-6 flex items-center gap-4">
                      {t.avatar_url && (
                        <Image
                          src={t.avatar_url}
                          alt={t.client_name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">{t.client_name}</p>
                        {t.treatment_ref && (
                          <p className="text-xs text-neutral-500">Treatment: {t.treatment_ref}</p>
                        )}
                      </div>
                    </footer>
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => emblaApi?.scrollPrev()} className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-neutral-50 transition-colors" aria-label="Previous testimonial">
            <ChevronLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <button onClick={() => emblaApi?.scrollNext()} className="absolute -right-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-neutral-50 transition-colors" aria-label="Next testimonial">
            <ChevronRight className="h-5 w-5 text-neutral-600" />
          </button>
        </div>
      </div>
    </section>
  )
}
