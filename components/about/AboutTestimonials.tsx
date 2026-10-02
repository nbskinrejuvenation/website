import { Star } from 'lucide-react'
import type { Testimonial } from '@/types/database'

interface Props {
  testimonials: Testimonial[]
}

/** Client reviews in the About page's sage style (the shared TestimonialsSection is dark). */
export function AboutTestimonials({ testimonials }: Props) {
  return (
    <section className="bg-sage-200 py-16 md:py-24">
      <div className="section-container">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-sage-700">
            See what
          </p>
          <h2 className="font-display text-3xl font-light text-sage-900 md:text-[38px]">
            Our clients say
          </h2>
          <div className="mx-auto mt-3 h-px w-7 bg-brand-400" />
        </div>

        <ul className="grid gap-6 md:grid-cols-2" role="list">
          {testimonials.map(t => (
            <li
              key={t.id}
              className="relative flex flex-col rounded-xl bg-sage-50 p-8 shadow-[0_12px_32px_rgba(45,45,35,0.08)] md:p-10"
            >
              <span
                className="absolute right-8 top-4 font-display text-7xl leading-none text-sage-300"
                aria-hidden="true"
              >
                &rdquo;
              </span>
              <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-brand-400 text-brand-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-sage-800">
                {t.body}
              </blockquote>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-sage-300 pt-5">
                <p className="font-medium text-sage-900">{t.client_name}</p>
                {t.treatment_ref && (
                  <span className="rounded-sm bg-sage-200 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-sage-700">
                    {t.treatment_ref}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
