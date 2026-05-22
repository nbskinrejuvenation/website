'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import type { Testimonial } from '@/types/database'
import { easeOut } from '@/lib/motion/config'

interface Props {
  testimonials: Testimonial[]
  eyebrow?: string
  heading?: string
}

function ClientAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-100"
      />
    )
  }

  const initials = name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700 ring-2 ring-brand-50"
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

function StarRating() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-brand-400 text-brand-400" aria-hidden="true" />
      ))}
    </div>
  )
}

function TestimonialCard({
  testimonial,
  index,
  reduceMotion,
}: {
  testimonial: Testimonial
  index: number
  reduceMotion: boolean | null
}) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.75, delay: index * 0.12, ease: easeOut }}
      className="group relative flex h-full flex-col overflow-hidden rounded-sm bg-cream p-8 shadow-[0_8px_40px_-12px_rgba(42,38,36,0.15)] ring-1 ring-cream/80 md:p-10"
    >
      <Quote
        className="absolute right-6 top-6 h-9 w-9 text-brand-200/90 transition-colors group-hover:text-brand-300"
        strokeWidth={1}
        aria-hidden="true"
      />

      <StarRating />

      <blockquote className="mt-6 flex-1">
        <p className="text-[15px] leading-[1.8] text-ink-muted md:text-base md:leading-[1.85]">
          {testimonial.body}
        </p>
      </blockquote>

      <footer className="mt-8 flex items-center gap-4 border-t border-sand-dark/50 pt-6">
        <ClientAvatar name={testimonial.client_name} avatarUrl={testimonial.avatar_url} />
        <div className="min-w-0">
          <p className="font-medium text-ink">{testimonial.client_name}</p>
          {testimonial.treatment_ref && (
            <p className="mt-1.5">
              <span className="inline-block rounded-sm bg-brand-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-brand-700">
                {testimonial.treatment_ref}
              </span>
            </p>
          )}
        </div>
      </footer>
    </motion.article>
  )
}

export function TestimonialsSection({
  testimonials,
  eyebrow = 'See what',
  heading = 'Our clients say',
}: Props) {
  const reduceMotion = useReducedMotion()

  if (testimonials.length === 0) return null

  return (
    <section
      className="relative overflow-hidden bg-brand-950 py-20 md:py-28"
      aria-labelledby="testimonials-heading"
    >
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand-800/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-brand-700/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="section-container relative">
        <div className="mx-auto mb-12 max-w-xl text-center md:mb-16">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-brand-200">
            {eyebrow}
          </p>
          <h2
            id="testimonials-heading"
            className="font-display text-3xl font-light tracking-tight text-cream md:text-4xl lg:text-[2.75rem]"
          >
            {heading}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cream/60">
            Real stories from women who chose a personalised approach to skin rejuvenation
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={t.id}
              testimonial={t}
              index={i}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
