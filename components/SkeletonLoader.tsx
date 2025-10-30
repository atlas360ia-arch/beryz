/**
 * Composants Skeleton Loaders réutilisables pour améliorer l'UX pendant les chargements
 */

export function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-etsy-gray-light rounded ${className}`}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ className = '' }: { className?: string }) {
  return <SkeletonBox className={`h-4 ${className}`} />
}

export function SkeletonTitle({ className = '' }: { className?: string }) {
  return <SkeletonBox className={`h-6 ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image skeleton */}
      <SkeletonBox className="h-48 w-full" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <SkeletonTitle className="w-3/4" />

        {/* Price */}
        <SkeletonText className="w-1/2" />

        {/* Location and date */}
        <div className="flex items-center justify-between">
          <SkeletonText className="w-1/3" />
          <SkeletonText className="w-1/4" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonListingDetail() {
  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button skeleton */}
        <SkeletonText className="w-32 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main image */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <SkeletonBox className="h-96 w-full mb-4" />
              {/* Thumbnails */}
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonBox key={i} className="h-20" />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <SkeletonTitle className="w-1/4 mb-4" />
              <div className="space-y-2">
                <SkeletonText className="w-full" />
                <SkeletonText className="w-full" />
                <SkeletonText className="w-3/4" />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <SkeletonText className="w-1/3 mb-4" />
              <SkeletonTitle className="w-full mb-4" />
              <SkeletonTitle className="w-2/3 mb-6" />
              <SkeletonBox className="w-full h-12 mb-3" />
              <SkeletonBox className="w-full h-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonConversationList({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-etsy-gray-light">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 flex items-start gap-3">
          <SkeletonBox className="w-12 h-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <SkeletonText className="w-1/3" />
              <SkeletonText className="w-12" />
            </div>
            <SkeletonText className="w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonMessage() {
  return (
    <div className="flex items-start gap-3 mb-4">
      <SkeletonBox className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-16 w-2/3 rounded-2xl" />
      </div>
    </div>
  )
}
