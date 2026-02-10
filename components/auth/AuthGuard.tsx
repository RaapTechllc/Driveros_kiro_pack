'use client'

import { type ReactNode } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: ReactNode
  /** Content to show while loading */
  loadingFallback?: ReactNode
  /** Content to show when not authenticated */
  unauthenticatedFallback?: ReactNode
}

/**
 * Component that guards content behind authentication.
 * Shows loading state while auth is initializing.
 */
export function AuthGuard({
  children,
  loadingFallback,
  unauthenticatedFallback,
}: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <>
        {loadingFallback || (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </>
    )
  }

  // Show unauthenticated fallback
  if (!isAuthenticated) {
    return <>{unauthenticatedFallback || null}</>
  }

  return <>{children}</>
}
