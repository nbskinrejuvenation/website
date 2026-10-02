import Link from 'next/link'
import Image from 'next/image'

interface Props {
  businessName?: string
  /** Light text for dark header; default for footer and light backgrounds. */
  variant?: 'default' | 'light'
}

export function Logo({ variant = 'default' }: Props) {
  if (variant === 'light') {
    return (
      <Link
        href="/"
        aria-label="Naturally Beautiful Skin Rejuvenation — home"
        className="block transition-opacity hover:opacity-80"
      >
        <div className="relative h-[64px] w-[164px]">
          <div className="absolute inset-x-0 top-0 h-14 overflow-visible">
            <Image
              src="/logo.png"
              alt="Naturally Beautiful"
              width={500}
              height={171}
              priority
              className="h-14 w-auto brightness-0 invert"
            />
          </div>
          <span className="absolute left-[58%] top-[54px] w-[56px] -translate-x-1/2 text-center text-[5px] font-medium leading-none tracking-[0.05em] text-cream">
            Skin rejuvenation
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link href="/" aria-label="Naturally Beautiful Skin Rejuvenation — home">
      <Image
        src="/logo.png"
        alt="Naturally Beautiful Skin Rejuvenation"
        width={500}
        height={171}
        priority
        className="h-14 w-auto object-contain transition-opacity hover:opacity-80"
      />
    </Link>
  )
}
