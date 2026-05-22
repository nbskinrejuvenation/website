'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { heroStagger, kenBurns } from '@/lib/motion/config'

interface Props {
  eyebrow?: string
  heading: ReactNode
  subheading?: string
  ctaLabel: string
  ctaHref: string
  phone?: string
  heroImageUrl?: string
  heroImageAlt?: string
}

export function HeroSection({
  eyebrow,
  heading,
  subheading,
  ctaLabel,
  ctaHref,
  phone,
  heroImageUrl,
  heroImageAlt,
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
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-phone">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {phone}
              </a>
            )}
            <Link href={ctaHref} className="btn-outline">
              {ctaLabel}
            </Link>
          </motion.div>

          <motion.p
            className="mt-6 text-sm text-ink-faint"
            variants={reduceMotion ? undefined : heroStagger.item}
          >
            Free 30-minute consultation · By appointment · Dee Why
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
