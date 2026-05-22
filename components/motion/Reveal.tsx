'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeUp, fadeUpTransition } from '@/lib/motion/config'
import { cn } from '@/lib/utils/cn'

interface Props {
  children: ReactNode
  className?: string
  /** Seconds before animation starts */
  delay?: number
}

/** Scroll-triggered fade-up — subtle, once per section */
export function Reveal({ children, className, delay = 0 }: Props) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={cn(className)}
      initial={fadeUp.hidden}
      whileInView={fadeUp.visible}
      viewport={{ once: true, margin: '-48px' }}
      transition={fadeUpTransition(0.75, delay)}
    >
      {children}
    </motion.div>
  )
}
