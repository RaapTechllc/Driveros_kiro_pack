import { cn } from "@/lib/utils"

interface RacingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RacingSpinner({ size = 'md', className }: RacingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700" />
      
      {/* Racing stripe spinner */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 border-r-yellow-500 animate-spin" />
      
      {/* Inner gear teeth effect */}
      <div className="absolute inset-1 rounded-full border border-gray-300 dark:border-gray-600 animate-spin-reverse" />
      
      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500" />
    </div>
  )
}

interface LoadingStateProps {
  children: React.ReactNode
  loading?: boolean
  className?: string
}

export function LoadingState({ children, loading, className }: LoadingStateProps) {
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex flex-col items-center gap-3">
          <RacingSpinner size="lg" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800",
      "before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer",
      className
    )} />
  )
}

export function CardSkeleton() {
  return (
    <div className="border-2 rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 flex-1" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}
