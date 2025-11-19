/**
 * Skeleton - Loading skeleton component
 */
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-800/50',
        className
      )}
      {...props}
    />
  )
}

/**
 * ClubCardSkeleton - Skeleton for club cards
 */
export function ClubCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden h-full">
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full" />

      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Tagline */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        {/* Member count */}
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

/**
 * ClubGridSkeleton - Skeleton for club grid
 */
interface ClubGridSkeletonProps {
  count?: number
}

export function ClubGridSkeleton({ count = 8 }: ClubGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ClubCardSkeleton key={index} />
      ))}
    </div>
  )
}

/**
 * AssessmentSkeleton - Skeleton for assessment page
 */
export function AssessmentSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Question */}
      <div className="glass-card p-8 space-y-6">
        <Skeleton className="h-8 w-3/4 mx-auto" />

        {/* Options */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

/**
 * ProfileSkeleton - Skeleton for profile page
 */
export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="glass-card p-6 space-y-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Content tabs */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />

        {/* Content cards */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="glass-card p-6 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
