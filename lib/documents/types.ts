/**
 * Document generation types for DriverOS.
 * Supports branded PDF reports, scorecards, and client-facing documents.
 */

import type { BrandConfig, ScoreRecord } from '@/lib/data/backend'
import type { EngineName } from '@/lib/supabase/types'

export interface DocumentConfig {
  orgId: string
  title: string
  template: TemplateType
  brandConfig?: BrandConfig | null
  dateRange?: { start: string; end: string }
  includeCharts?: boolean
  format?: 'pdf' | 'html'
}

export type TemplateType =
  | 'weekly-scorecard'
  | 'quarterly-review'
  | 'client-report'
  | 'monthly-health'
  | 'annual-plan'
  | 'flash-scan-results'
  | 'full-audit-results'

export interface ReportTemplate {
  type: TemplateType
  name: string
  description: string
  sections: ReportSection[]
}

export interface ReportSection {
  id: string
  title: string
  type: 'summary' | 'scores' | 'actions' | 'trends' | 'checkins' | 'text' | 'table'
  required: boolean
}

export interface EngineScoreData {
  engine: EngineName
  score: number
  maxScore: number
  trend: 'up' | 'down' | 'flat'
  changePercent: number
}

export interface WeeklyScorecardData {
  orgName: string
  weekOf: string
  overallScore: number
  gear: number
  engineScores: EngineScoreData[]
  actionsCompleted: number
  actionsTotal: number
  checkInStreak: number
  topWins: string[]
  topBlockers: string[]
  nextWeekFocus: string[]
}

export interface QuarterlyReviewData {
  orgName: string
  quarter: string
  year: number
  overallScoreTrend: ScoreRecord[]
  engineTrends: Record<EngineName, ScoreRecord[]>
  gearProgression: { start: number; end: number }
  actionsCompleted: number
  actionsCreated: number
  meetingsHeld: number
  checkInRate: number
  northStarGoal: string
  northStarProgress: string
  keyAccomplishments: string[]
  areasForImprovement: string[]
  nextQuarterPriorities: string[]
}

export interface ClientReportData {
  orgName: string
  clientName?: string
  reportDate: string
  projectSummary: string
  engineScores: EngineScoreData[]
  keyMetrics: { label: string; value: string; trend?: 'up' | 'down' | 'flat' }[]
  recommendations: { title: string; priority: string; description: string }[]
  nextSteps: string[]
}

export interface GeneratedDocument {
  id: string
  orgId: string
  template: TemplateType
  title: string
  content: string // HTML content
  generatedAt: string
  metadata: Record<string, unknown>
}
