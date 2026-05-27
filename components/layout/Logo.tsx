import Image from 'next/image'
import Link from 'next/link'
import { LOGO_LIGHT_SVG, LOGO_SVG } from '@/lib/brand/logo'
import { cn } from '@/lib/utils/cn'

interface Props {
  businessName?: string
  /** Light logo for dark backgrounds (header, footer). Default for cream/light pages. */
  variant?: 'default' | 'light'
  /** sm = header; md = footer */
  size?: 'sm' | 'md'
  className?: string
}

const SIZES = {
  sm: { width: 52, height: 52, className: 'h-[52px] w-[52px]' },
  md: { width: 64, height: 64, className: 'h-16 w-16' },
} as const

export function Logo({
  businessName: _businessName,
  variant = 'default',
  size = 'sm',
  className,
}: Props) {
  const isLight = variant === 'light'
  const src = isLight ? LOGO_LIGHT_SVG : LOGO_SVG
  const dims = SIZES[size]

  return (
    <Link
      href="/"
      className={cn('inline-flex shrink-0 items-center', className)}
      aria-label="Naturally Beautiful Skin Rejuvenation — home"
    >
      <Image
        src={src}
        alt=""
        width={dims.width}
        height={dims.height}
        className={cn(dims.className, 'object-contain')}
        priority={size === 'sm'}
      />
    </Link>
  )
}
