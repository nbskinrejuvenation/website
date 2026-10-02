import Link from 'next/link'
import Image from 'next/image'

interface Props {
  businessName?: string
  /** Light text for dark header; default for footer and light backgrounds. */
  variant?: 'default' | 'light'
}

export function Logo({ variant = 'default' }: Props) {
  return (
    <Link href="/" aria-label="Naturally Beautiful Skin Rejuvenation — home">
      <Image
        src="/logo.png"
        alt="Naturally Beautiful Skin Rejuvenation"
        width={500}
        height={171}
        priority
        className={`h-14 w-auto object-contain transition-opacity hover:opacity-80 ${
          variant === 'light' ? 'brightness-0 invert' : ''
        }`}
      />
    </Link>
  )
}
