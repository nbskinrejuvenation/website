import Link from 'next/link'

interface Props {
  businessName?: string
}

/** Wordmark — drop your existing logo into public/logo.png when ready. */
export function Logo({ businessName: _businessName }: Props) {
  return (
    <Link href="/" className="group flex flex-col leading-tight" aria-label="Naturally Beautiful — home">
      <span className="font-display text-xl font-light tracking-tight text-ink transition-colors group-hover:text-brand-600 md:text-[1.35rem]">
        Naturally Beautiful
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-ink-faint">
        Skin Rejuvenation
      </span>
    </Link>
  )
}
