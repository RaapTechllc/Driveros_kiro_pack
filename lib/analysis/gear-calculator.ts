/**
 * DriverOS Gear Calculator
 *
 * Determines the current business gear (1-5) based on:
 * - Revenue (primary if provided)
 * - Score + size-based heuristic (fallback)
 */

import type { GearNumber } from '../types'
import {
  getGearByRevenue,
  getGearByScore,
  getGearBySizeband,
  type GearDefinition
} from '../frameworks/gears'

/** Context for gear determination */
export interface GearContext {
  overallScore: number
  revenue?: number
  sizeband?: string
}

/** Result of gear calculation */
export interface GearCalculationResult {
  gear: GearNumber
  label: string
  reason: string
  mode: string
  definition: GearDefinition
}

/**
 * Determine the business gear based on available context
 *
 * Priority:
 * 1. Revenue (most reliable indicator)
 * 2. Size band (good proxy for stage)
 * 3. Overall score (fallback when no other data)
 */
export function determineGear(context: GearContext): GearCalculationResult {
  let gearDef: GearDefinition
  let reason: string

  // Primary: Revenue-based determination
  if (context.revenue !== undefined && context.revenue > 0) {
    gearDef = getGearByRevenue(context.revenue)
    reason = `Based on annual revenue of ${formatRevenue(context.revenue)}`
  }
  // Secondary: Size band-based determination
  else if (context.sizeband) {
    gearDef = getGearBySizeband(context.sizeband)
    reason = `Based on company size of ${context.sizeband} employees`
  }
  // Fallback: Score-based determination
  else {
    gearDef = getGearByScore(context.overallScore)
    reason = `Based on overall score of ${context.overallScore}%`
  }

  return {
    gear: gearDef.number,
    label: gearDef.label,
    reason,
    mode: gearDef.mode,
    definition: gearDef
  }
}

/**
 * Format revenue for display
 */
function formatRevenue(revenue: number): string {
  if (revenue >= 1000000) {
    return `$${(revenue / 1000000).toFixed(1)}M`
  }
  if (revenue >= 1000) {
    return `$${(revenue / 1000).toFixed(0)}K`
  }
  return `$${revenue}`
}

/**
 * Get gear advancement advice
 */
export function getGearAdvancement(gear: GearNumber): string {
  const advancementMessages: Record<GearNumber, string> = {
    1: 'Focus on achieving consistent sales and basic positive cash flow to shift to Gear 2',
    2: 'Document core processes, assign clear ownership, and achieve consistent profitability to shift to Gear 3',
    3: 'Build a true leadership team and refine systems for scale to shift to Gear 4',
    4: 'Reduce key person dependency and achieve strategic valuation to reach Gear 5',
    5: 'You\'re at Apex - focus on sustaining excellence and strategic legacy'
  }
  return advancementMessages[gear]
}

/**
 * Get gear icon/emoji for display
 */
export function getGearIcon(gear: GearNumber): string {
  const icons: Record<GearNumber, string> = {
    1: '🔒',
    2: '🚗',
    3: '🚀',
    4: '🏎️',
    5: '👑'
  }
  return icons[gear]
}

/**
 * Determine if business is at risk based on score vs gear mismatch
 */
export function detectGearScoreMismatch(
  gear: GearNumber,
  overallScore: number
): { hasMismatch: boolean; message?: string } {
  // Expected score ranges per gear
  const expectedScoreRanges: Record<GearNumber, { min: number; max: number }> = {
    1: { min: 0, max: 30 },
    2: { min: 20, max: 50 },
    3: { min: 40, max: 70 },
    4: { min: 60, max: 85 },
    5: { min: 75, max: 100 }
  }

  const range = expectedScoreRanges[gear]

  // Score too low for gear (risk of breakdown)
  if (overallScore < range.min) {
    return {
      hasMismatch: true,
      message: `Your systems score (${overallScore}%) is low for Gear ${gear}. Focus on strengthening foundations to avoid breakdown.`
    }
  }

  // Score too high for gear (ready to shift up)
  if (overallScore > range.max && gear < 5) {
    return {
      hasMismatch: true,
      message: `Your systems score (${overallScore}%) suggests you may be ready to shift to Gear ${gear + 1}.`
    }
  }

  return { hasMismatch: false }
}
