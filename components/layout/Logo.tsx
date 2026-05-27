import Image from 'next/image'
import Link from 'next/link'
import { LOGO_DEFAULT, LOGO_LIGHT } from '@/lib/brand/logo'
import { cn } from '@/lib/utils/cn'

interface Props {
  businessName?: string
  /** `light` = cream logo for dark backgrounds (footer). `default` for header on rose. */
  variant?: 'default' | 'light'
  size?: 'sm' | 'md'
  className?: string
}

const SIZES = {
  sm: { width: 48, height: 48, className: 'h-12 w-12' },
  md: { width: 56, height: 56, className: 'h-14 w-14' },
} as const

export function Logo({
  businessName: _businessName,
  variant = 'default',
  size = 'sm',
  className,
}: Props) {
  const src = variant === 'light' ? LOGO_LIGHT : LOGO_DEFAULT
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
