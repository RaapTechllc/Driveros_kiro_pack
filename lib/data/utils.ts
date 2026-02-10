/**
 * Utility functions for data layer
 */

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
