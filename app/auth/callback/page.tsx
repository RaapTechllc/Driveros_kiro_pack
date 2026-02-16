'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const next = searchParams.get('next') || '/dashboard'

      if (code) {
        const supabase = createClient()
        
        // Exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('Auth callback error:', exchangeError)
          setError(exchangeError.message)
          return
        }

        // Check if user has an organization, redirect to onboarding if not
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Check for existing membership/org
          const { data: membership } = await supabase
            .from('memberships')
            .select('*, orgs(*)')
            .eq('user_id', user.id)
            .limit(1)
            .single()

          if (!membership) {
            // No org yet - redirect to onboarding
            router.push('/onboarding')
            router.refresh()
            return
          }
        }

        // Success - redirect to dashboard
        router.push(next)
        router.refresh()
      } else {
        // No code - check if already authenticated
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Check for existing membership/org
          const { data: membership } = await supabase
            .from('memberships')
            .select('*, orgs(*)')
            .eq('user_id', session.user.id)
            .limit(1)
            .single()

          if (!membership) {
            // No org yet - redirect to onboarding
            router.push('/onboarding')
          } else {
            router.push(next)
          }
        } else {
          setError('No authentication code received')
        }
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg mb-4">
            {error}
          </div>
          <a href="/login" className="text-primary hover:underline">
            Return to login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}
