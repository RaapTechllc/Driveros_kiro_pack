'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

/**
 * Next.js route-level error boundary
 * Catches errors in page components and server components
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console or error tracking service
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-red-600">
            Oops! Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We encountered an error while loading this page.
          </p>
        </div>

        {/* Show error digest in development */}
        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className="text-sm text-muted-foreground font-mono">
            Error ID: {error.digest}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
