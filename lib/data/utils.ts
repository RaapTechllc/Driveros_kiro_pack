/**
 * Utility functions for data layer
 */

/**
 * @deprecated Demo mode has been removed. This stub always returns false
 * so existing data layer modules compile. Will be removed in Phase 2
 * when data layer is rewritten for Supabase-only.
 */
export function isDemoMode(): false {
  return false
}

/**
 * Get the current org ID from context
 */
export function getOrgId(orgId?: string | null): string {
  if (!orgId) throw new Error('Organization ID is required')
  return orgId
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
