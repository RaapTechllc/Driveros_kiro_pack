'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createOrganization } from '@/lib/supabase/auth'

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoading, refreshUser } = useAuth()
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user?.currentOrg) {
      router.replace('/dashboard')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (!slugEdited) {
      setOrgSlug(toSlug(orgName))
    }
  }, [orgName, slugEdited])

  const slugError = useMemo(() => {
    if (!orgSlug) return 'Slug is required'
    if (orgSlug.length < 3) return 'Slug must be at least 3 characters'
    if (!/^[a-z0-9-]+$/.test(orgSlug)) return 'Use only lowercase letters, numbers, and dashes'
    return null
  }, [orgSlug])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!orgName.trim()) {
      setError('Organization name is required')
      return
    }

    if (slugError) {
      setError(slugError)
      return
    }

    setIsSubmitting(true)

    try {
      await createOrganization(orgName.trim(), orgSlug)
      await refreshUser()
      router.replace('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Building2 className="w-10 h-10 text-primary" />
            <span className="font-display text-3xl font-bold">DriverOS</span>
          </div>
          <p className="text-muted-foreground">Create your workspace</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="orgName" className="block text-sm font-medium mb-1.5">
                Organization name
              </label>
              <input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(event) => setOrgName(event.target.value)}
                placeholder="North Star Holdings"
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label htmlFor="orgSlug" className="block text-sm font-medium mb-1.5">
                Workspace URL slug
              </label>
              <input
                id="orgSlug"
                type="text"
                value={orgSlug}
                onChange={(event) => {
                  setSlugEdited(true)
                  setOrgSlug(toSlug(event.target.value))
                }}
                placeholder="north-star"
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This becomes your workspace identifier. You can change it later.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!slugError}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating workspace...
                </>
              ) : (
                'Create workspace'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
