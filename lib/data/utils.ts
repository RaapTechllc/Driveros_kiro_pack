/**
 * Utility functions for data layer
 */

/**
 * Check if we're in demo mode (no Supabase, use localStorage)
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  return (
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  )
}

/**
 * Get the current org ID from context or return 'demo' for demo mode
 */
export function getOrgId(orgId?: string | null): string {
  return orgId || 'demo'
}

/**
 * Generate a UUID
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Get current ISO timestamp
 */
export function now(): string {
  return new Date().toISOString()
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function today(): string {
  return new Date().toISOString().split('T')[0]
}
