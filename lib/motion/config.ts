/** Shared motion tokens — subtle luxury easing */
export const easeOut = [0.22, 1, 0.36, 1] as const

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export const fadeUpTransition = (duration = 0.75, delay = 0) => ({
  duration,
  delay,
  ease: easeOut,
})

export const heroStagger = {
  container: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOut },
    },
  },
}

export const kenBurns = {
  scale: 1.05,
  transition: {
    duration: 22,
    ease: 'easeInOut',
    repeat: Infinity,
    repeatType: 'reverse' as const,
  },
}
