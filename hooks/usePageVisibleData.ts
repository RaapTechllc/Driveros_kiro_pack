'use client'

import { useEffect } from 'react'

/**
 * Module-level store for the current page's visible data.
 * Only one page is active at a time in Next.js, so a singleton is safe.
 * The AI coach reads this when building page context for the chat API.
 */
let currentVisibleData: Record<string, unknown> = {}

/**
 * Get the current page's visible data.
 * Called by useAICoach when building PageContext.
 */
export function getVisibleData(): Record<string, unknown> {
  return currentVisibleData
}

/**
 * Hook for pages to expose their visible data to the AI coach.
 * Data is cleared on unmount to prevent stale context.
 *
 * Usage:
 *   usePageVisibleData({ engineScores: { vision: 72, people: 58 }, gear: 3 })
 */
export function usePageVisibleData(data: Record<string, unknown>) {
  useEffect(() => {
    currentVisibleData = data
    return () => {
      currentVisibleData = {}
    }
  }, [JSON.stringify(data)])
}
