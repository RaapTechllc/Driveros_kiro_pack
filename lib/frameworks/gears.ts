/**
 * DriverOS Gear System (1-5 Scale)
 *
 * Maps business maturity to a driving metaphor.
 * As a company grows, it shifts gears through five levels of maturity.
 */

import type { GearNumber } from '../types'

export interface GearDefinition {
  number: GearNumber
  name: string
  label: string
  mode: string
  revenueRange: {
    min: number
    max: number | null // null = unlimited
    display: string
  }
  indicators: string[]
  leadershipStyle: string
  advancementUnlock: string
  prescription: string
  commonTraps: string[]
}

/**
 * Gear 1 - Idle (Survival Mode)
 * Just starting or stagnant, founder wearing all hats
 */
export const GEAR_1_IDLE: GearDefinition = {
  number: 1,
  name: 'idle',
  label: 'Idle',
  mode: 'Survival',
  revenueRange: {
    min: 0,
    max: 250000,
    display: '$0 - $250K'
  },
  indicators: [
    'Owner-operated with no formal systems',
    'Founder wearing all hats',
    'Focus on short-term survival',
    'Finding product-market fit',
    'Making the next sale'
  ],
  leadershipStyle: 'Reactive - "just get it done" hustle',
  advancementUnlock: 'Achieve consistent sales and basic positive cash flow (prove the concept)',
  prescription: 'Focus on core product/service viability, get repeat customers, document the most critical process',
  commonTraps: [
    'Chasing too many ideas (never gaining traction)',
    'Running out of cash due to lack of budget',
    'Failure to delegate anything'
  ]
}

/**
 * Gear 2 - Cruising (Stability Mode)
 * Modest momentum with reliable revenue, basic systems emerging
 */
export const GEAR_2_CRUISING: GearDefinition = {
  number: 2,
  name: 'cruising',
  label: 'Cruising',
  mode: 'Stability',
  revenueRange: {
    min: 250000,
    max: 1000000,
    display: '$250K - $1M'
  },
  indicators: [
    'Reliable revenue stream',
    'Small team beyond the founder',
    'Roles starting to be defined',
    'Out of survival but not aggressive growth',
    'Basic systems in place'
  ],
  leadershipStyle: 'Focus on establishing consistency: SOPs, consistent customer experience',
  advancementUnlock: 'Document core processes, assign clear ownership, achieve consistent profitability (2+ quarters)',
  prescription: 'Establish standard operating procedures for repeatable tasks, deliver consistent customer experience',
  commonTraps: [
    'Getting comfortable at cruising speed (plateau)',
    'Founder micromanaging instead of systematizing',
    'Hiring friends/family instead of competent role-fit people',
    'Avoiding process discipline ("we\'re small, we don\'t need it")'
  ]
}

/**
 * Gear 3 - Accelerating (Efficiency Mode)
 * Scaling up revenue and team, systems being optimized
 */
export const GEAR_3_ACCELERATING: GearDefinition = {
  number: 3,
  name: 'accelerating',
  label: 'Accelerating',
  mode: 'Efficiency',
  revenueRange: {
    min: 1000000,
    max: 5000000,
    display: '$1M - $5M'
  },
  indicators: [
    'Scaling revenue and team',
    'Systems and processes being optimized',
    'Adding fuel to the engine',
    'Expanded sales efforts',
    'Fundamentals more solid'
  ],
  leadershipStyle: 'Team-centric: delegating to managers/COO, focusing on metrics and strategy',
  advancementUnlock: 'Build a true leadership team, refine systems for scale, establish mid-level managers and KPIs',
  prescription: 'Transition to delegation, implement KPIs for all departments, ensure culture scales with team',
  commonTraps: [
    'Growing pains - systems that worked at $1M break at $3M',
    'Process overload - bureaucracy slowing agility',
    'Not upgrading talent - great generalists need upskilling or role changes'
  ]
}

/**
 * Gear 4 - Racing (Scalability Mode)
 * High-growth or high-efficiency mode at top speed
 */
export const GEAR_4_RACING: GearDefinition = {
  number: 4,
  name: 'racing',
  label: 'Racing',
  mode: 'Scalability',
  revenueRange: {
    min: 5000000,
    max: 25000000,
    display: '$5M - $25M'
  },
  indicators: [
    'High performance mode',
    'Multiple teams or departments',
    'Seasoned leaders in key roles',
    'Advanced systems and automation',
    'Strategy-driven with budgeting and data-driven decisions'
  ],
  leadershipStyle: 'Steer culture and strategy; strong executive team runs day-to-day (visionary/integrator)',
  advancementUnlock: 'Reduce key person dependency, business can run without founder\'s daily involvement, strategic valuation',
  prescription: 'Guard against burnout, maintain innovation cycles, reinforce culture at scale',
  commonTraps: [
    'Small issues become big problems fast at race speed',
    'Cultural misalignment or process gaps scale into major failures',
    'Losing innovation - resting on laurels while competitors catch up',
    'Burnout from running hot without pit stops'
  ]
}

/**
 * Gear 5 - Apex (Legacy Mode)
 * Peak performance, business operates as an empire
 */
export const GEAR_5_APEX: GearDefinition = {
  number: 5,
  name: 'apex',
  label: 'Apex',
  mode: 'Legacy',
  revenueRange: {
    min: 25000000,
    max: null,
    display: '$25M+'
  },
  indicators: [
    'Business operates as an empire',
    'Market leader position',
    'Optimal systems with minimal firefighting',
    'Founder can step away and machine keeps running',
    'Self-managing organization'
  ],
  leadershipStyle: 'Legacy and expansion: succession plans, new markets, philanthropic angles',
  advancementUnlock: 'No higher gear - sustain excellence, strategically decide exit or new growth curve',
  prescription: 'Robust financials, strong bench of talent, formal governance, maintain agility and purpose',
  commonTraps: [
    'Complacency - success breeding stagnation',
    'Innovator\'s dilemma',
    'Founder who can\'t trust the self-managing company (meddling)',
    'Losing entrepreneurial spirit to bureaucracy'
  ]
}

/** All gears as an indexed object */
export const GEARS: Record<GearNumber, GearDefinition> = {
  1: GEAR_1_IDLE,
  2: GEAR_2_CRUISING,
  3: GEAR_3_ACCELERATING,
  4: GEAR_4_RACING,
  5: GEAR_5_APEX
}

/** Ordered list of gear numbers */
export const GEAR_ORDER: GearNumber[] = [1, 2, 3, 4, 5]

/**
 * Get gear based on revenue amount
 */
export function getGearByRevenue(revenue: number): GearDefinition {
  if (revenue >= 25000000) return GEAR_5_APEX
  if (revenue >= 5000000) return GEAR_4_RACING
  if (revenue >= 1000000) return GEAR_3_ACCELERATING
  if (revenue >= 250000) return GEAR_2_CRUISING
  return GEAR_1_IDLE
}

/**
 * Get gear based on overall score when revenue is unknown
 */
export function getGearByScore(score: number): GearDefinition {
  // Map 0-100 score to gear
  // 80-100 = Gear 5, 60-79 = Gear 4, 40-59 = Gear 3, 20-39 = Gear 2, 0-19 = Gear 1
  if (score >= 80) return GEAR_5_APEX
  if (score >= 60) return GEAR_4_RACING
  if (score >= 40) return GEAR_3_ACCELERATING
  if (score >= 20) return GEAR_2_CRUISING
  return GEAR_1_IDLE
}

/**
 * Get gear based on company size band
 */
export function getGearBySizeband(sizeband: string): GearDefinition {
  switch (sizeband) {
    case '1-10':
      return GEAR_2_CRUISING
    case '11-50':
      return GEAR_3_ACCELERATING
    case '51-200':
      return GEAR_4_RACING
    case '201+':
      return GEAR_5_APEX
    default:
      return GEAR_2_CRUISING
  }
}
