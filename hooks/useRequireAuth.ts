'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

interface UseRequireAuthOptions {
  redirectTo?: string
  requireOrg?: boolean
}

/**
 * Hook to require authentication on a page.
 * Redirects to login if user is not authenticated.
 * Returns loading state and user data.
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = '/login', requireOrg = false } = options
  const { user, isLoading, isAuthenticated, isDemoMode } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Skip auth check in demo mode
    if (isDemoMode) return

    // Wait for auth to load
    if (isLoading) return

    // Redirect if not authenticated
    if (!isAuthenticated) {
      const currentPath = window.location.pathname
      const returnUrl = currentPath !== '/' ? `?returnTo=${encodeURIComponent(currentPath)}` : ''
      router.push(`${redirectTo}${returnUrl}`)
      return
    }

    // Check for org membership if required
    if (requireOrg && !user?.currentOrg) {
      router.push('/onboarding')
    }
  }, [isLoading, isAuthenticated, isDemoMode, user, requireOrg, redirectTo, router])

  return {
    user,
    isLoading: isDemoMode ? false : isLoading,
    isAuthenticated: isDemoMode ? true : isAuthenticated,
    isDemoMode,
  }
}
