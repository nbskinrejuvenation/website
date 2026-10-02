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
        <div className="relative h-14 w-[164px]">
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
          <div className="absolute bottom-0 left-[20%] h-[10px] w-[70%] bg-brand-600" aria-hidden="true" />
          <span className="absolute bottom-[1px] left-[43%] -translate-x-1/2 whitespace-nowrap text-[5px] font-medium leading-none tracking-[0.08em] text-cream">
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
