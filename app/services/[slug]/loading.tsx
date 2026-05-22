import { Skeleton } from '@/components/ui/Skeleton'

export default function ServiceLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="relative h-[60vh] bg-neutral-100">
        <Skeleton className="absolute inset-0" />
      </div>
      {/* Content skeleton */}
      <div className="section-container py-16 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}
