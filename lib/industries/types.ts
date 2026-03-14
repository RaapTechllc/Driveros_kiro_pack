/**
 * Industry Plugin System
 *
 * Each industry gets a plugin that provides context-specific questions,
 * KPIs, benchmarks, compliance items, and document templates.
 * The AI coach uses this to give industry-relevant advice.
 */

import type { FrameworkEngineName, GearNumber } from '@/lib/types'

/** A diagnostic question specific to an industry */
export interface IndustryQuestion {
  id: string
  /** Which engine this question maps to */
  engine: FrameworkEngineName
  /** The question text */
  question: string
  /** Why this question matters for this industry */
  rationale: string
  /** Which gear levels this question is most relevant for */
  gearRelevance: GearNumber[]
  /** Scoring: what a low/mid/high answer looks like */
  scoring: {
    low: string
    mid: string
    high: string
  }
}

/** An industry-specific KPI with benchmarks */
export interface IndustryKPI {
  id: string
  name: string
  description: string
  engine: FrameworkEngineName
  /** How to calculate this KPI */
  formula: string
  /** Unit of measurement (%, $, days, ratio, etc.) */
  unit: string
  /** Benchmark ranges by gear */
  benchmarks: Partial<Record<GearNumber, { poor: number; average: number; good: number; elite: number }>>
  /** Data source hint (where would the user find this number?) */
  dataSourceHint: string
}

/** Compliance or regulatory item */
export interface ComplianceItem {
  id: string
  name: string
  description: string
  /** Who enforces this (OSHA, state, federal, industry body) */
  authority: string
  /** Risk level if non-compliant */
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  /** How often to check (days) */
  reviewCadenceDays: number
  /** Engine this compliance item affects */
  engine: FrameworkEngineName
}

/** Document template metadata */
export interface DocumentTemplate {
  id: string
  name: string
  description: string
  /** Template category */
  category: 'operations' | 'finance' | 'people' | 'legal' | 'sales' | 'reporting'
  /** Which gear this template is most useful for */
  gearRelevance: GearNumber[]
  /** Field definitions for the template */
  fields: { name: string; type: 'text' | 'number' | 'date' | 'select' | 'textarea'; required: boolean; options?: string[] }[]
}

/** Seasonal pattern that affects business planning */
export interface SeasonalPattern {
  id: string
  name: string
  /** Months affected (1-12) */
  months: number[]
  /** Impact description */
  impact: string
  /** Recommended preparations */
  preparations: string[]
  engine: FrameworkEngineName
}

/** Market data context for the industry */
export interface MarketDataPoint {
  id: string
  name: string
  description: string
  /** Current value (may be placeholder if no live feed) */
  currentValue?: string
  /** Trend direction */
  trend?: 'up' | 'down' | 'stable'
  /** Impact on the business */
  businessImpact: string
  engine: FrameworkEngineName
}

/**
 * The IndustryPlugin interface.
 * Each industry implements this to provide context-specific intelligence.
 */
export interface IndustryPlugin {
  /** Unique identifier */
  id: string
  /** Display name */
  name: string
  /** Short description */
  description: string
  /** Icon emoji */
  icon: string

  /** Industry-specific diagnostic questions (added to base questions) */
  questions: IndustryQuestion[]

  /** Industry-specific KPIs with benchmarks */
  kpis: IndustryKPI[]

  /** Compliance and regulatory requirements */
  compliance: ComplianceItem[]

  /** Document templates */
  templates: DocumentTemplate[]

  /** Seasonal patterns */
  seasonalPatterns: SeasonalPattern[]

  /** Market data points to track */
  marketData: MarketDataPoint[]

  /**
   * Generate industry-specific AI prompt context.
   * Called by the AI coach to add industry knowledge to the system prompt.
   */
  getPromptContext(gear: GearNumber): string

  /**
   * Get the most relevant KPIs for a given gear level.
   */
  getKeyKPIs(gear: GearNumber): IndustryKPI[]

  /**
   * Get active seasonal alerts based on current month.
   */
  getActiveSeasonalAlerts(): SeasonalPattern[]
}

/** Registry of all available industry plugins */
export type IndustryPluginRegistry = Record<string, IndustryPlugin>
