import Link from 'next/link'

interface Props {
  businessName?: string
  /** Light text for dark header; default for footer and light backgrounds. */
  variant?: 'default' | 'light'
}

/** Wordmark — drop your existing logo into public/logo.png when ready. */
export function Logo({ businessName: _businessName, variant = 'default' }: Props) {
  const isLight = variant === 'light'

  return (
    <Link href="/" className="group flex flex-col leading-tight" aria-label="Naturally Beautiful — home">
      <span
        className={
          isLight
            ? 'font-display text-xl font-light tracking-tight text-cream transition-colors group-hover:text-brand-200 md:text-[1.35rem]'
            : 'font-display text-xl font-light tracking-tight text-ink transition-colors group-hover:text-brand-600 md:text-[1.35rem]'
        }
      >
        Naturally Beautiful
      </span>
      <span
        className={
          isLight
            ? 'text-[10px] font-medium uppercase tracking-[0.28em] text-brand-200'
            : 'text-[10px] font-medium uppercase tracking-[0.28em] text-brand-700'
        }
      >
        Skin Rejuvenation
      </span>
    </Link>
  )
}
