/**
 * Data Layer
 *
 * This module provides a unified interface for data access that works in both:
 * - Demo mode: Uses localStorage for persistence
 * - Production mode: Uses Supabase for server-side persistence
 *
 * Components should use these hooks/functions instead of directly accessing
 * localStorage or Supabase to ensure seamless transition between modes.
 */

export * from './actions'
export * from './assessments'
export * from './accelerators'
export * from './meetings'
export * from './north-star'
export * from './year-plan'
