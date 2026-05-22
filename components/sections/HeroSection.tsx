'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { heroStagger, kenBurns } from '@/lib/motion/config'

interface Props {
  eyebrow?: string
  heading: ReactNode
  subheading?: string
  ctaLabel: string
  ctaHref: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  heroImageUrl?: string
  heroImageAlt?: string
  /** Full clinic address shown under CTAs */
  locationLine?: string
}

export function HeroSection({
  eyebrow,
  heading,
  subheading,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  heroImageUrl,
  heroImageAlt,
  locationLine,
}: Props) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <div className="absolute inset-0">
        {heroImageUrl ? (
          <>
            <motion.div
              className="absolute inset-0"
              initial={reduceMotion ? false : { scale: 1 }}
              animate={reduceMotion ? undefined : { scale: kenBurns.scale }}
              transition={reduceMotion ? undefined : kenBurns.transition}
            >
              <Image
                src={heroImageUrl}
                alt={heroImageAlt ?? ''}
                fill
                className="object-cover object-center"
                priority
                sizes="100vw"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/80 to-cream/30" />
          </>
        ) : (
          <div className="hero-placeholder h-full w-full" aria-hidden="true" />
        )}
      </div>

      <div className="section-container relative z-10 flex min-h-[88vh] items-center py-20">
        <motion.div
          className="max-w-xl"
          variants={reduceMotion ? undefined : heroStagger.container}
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? undefined : 'visible'}
        >
          {eyebrow && (
            <motion.p className="eyebrow mb-5" variants={reduceMotion ? undefined : heroStagger.item}>
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            className="font-display text-4xl font-light leading-[1.15] tracking-tight text-ink md:text-5xl lg:text-6xl"
            variants={reduceMotion ? undefined : heroStagger.item}
          >
            {heading}
          </motion.h1>
          {subheading && (
            <motion.p
              className="mt-6 max-w-md text-base leading-relaxed text-ink-muted md:text-lg"
              variants={reduceMotion ? undefined : heroStagger.item}
            >
              {subheading}
            </motion.p>
          )}

          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
            variants={reduceMotion ? undefined : heroStagger.item}
          >
            {secondaryCtaLabel && secondaryCtaHref && (
              <Link href={secondaryCtaHref} className="btn-phone">
                {secondaryCtaLabel}
              </Link>
            )}
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-brand-800 px-8 py-3.5 text-sm font-medium tracking-wide text-cream transition-all duration-300 hover:bg-brand-900 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
            >
              {ctaLabel}
            </Link>
          </motion.div>

          {locationLine && (
            <motion.p
              className="mt-6 text-sm text-ink-faint"
              variants={reduceMotion ? undefined : heroStagger.item}
            >
              Free 30-minute consultation · By appointment · {locationLine}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
