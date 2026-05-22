import Link from 'next/link'
import Image from 'next/image'
import type { Special } from '@/types/database'

interface Props {
  special: Special
}

export function SpecialCard({ special }: Props) {
  return (
    <article className="flex flex-col overflow-hidden bg-white shadow-sm ring-1 ring-neutral-100">
      {special.image_url && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={special.image_url}
            alt={special.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-lg font-semibold text-neutral-800">{special.title}</h3>
        {special.description && (
          <p className="flex-1 text-sm text-neutral-600">{special.description}</p>
        )}
        <div className="mt-6">
          <Link href="/contact" className="btn-primary text-xs">
            Book Now
          </Link>
        </div>
      </div>
    </article>
  )
}
