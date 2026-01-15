// Domain objects from steering/domain-model.md
export interface Company {
  id: string
  tenant_id: string
  industry: string
  size_band: string
  north_star_goal_id?: string
}

export interface User {
  id: string
  company_id: string
  name?: string
  role: 'Owner' | 'CEO' | 'Leader' | 'Ops' | 'Sales' | 'Finance' | 'HR'
}

export interface IntakeSubmission {
  id: string
  company_id: string
  mode: 'flash' | 'audit'
  submitted_by_user_id: string
  completion_score: number
  answers: Record<string, any>
  created_at: string
}

// Flash Scan specific types
export const VALID_ROLES = ['Owner', 'Ops', 'Sales', 'Finance'] as const
export type OwnerRole = typeof VALID_ROLES[number]

export interface FlashScanData {
  industry: string
  size_band: string
  role: string
  north_star: string
  top_constraint: string
}

export interface QuickWin {
  title: string
  why: string
  owner_role: OwnerRole
  eta_days: number
  engine: string
}

export interface FlashScanResult {
  schema_version: string
  confidence_score: number
  accelerator: {
    kpi: string
    cadence: 'weekly'
    recommended: boolean
    notes: string
  }
  quick_wins: QuickWin[]
  gear_estimate: {
    number: number
    label: string
    reason: string
  }
  // Enhanced industry insights (optional)
  industry_insights?: {
    phase: string
    ltvCacTarget: { min: number; ideal: number }
    topConstraints: string[]
    leadGenPriority: string
  }
}

// Meeting types
export interface Meeting {
  id: string
  company_id: string
  type: 'warm_up' | 'pit_stop' | 'full_tune_up'
  scheduled_for: string | null
  notes: string | null
  decisions: string[]
  action_ids: string[]
  created_at: string
}

export interface MeetingTemplate {
  type: 'warm_up' | 'pit_stop' | 'full_tune_up'
  title: string
  duration_min: number
  description: string
  agenda: string[]
  inputs: string[]
  outputs: string[]
}

export interface MeetingFormData {
  // Warm-Up inputs
  yesterday_result?: string
  today_focus?: string
  top_brake?: string
  
  // Pit Stop inputs
  accelerator_actual?: string
  accelerator_target?: string
  accelerator_result?: 'win' | 'miss'
  
  // Full Tune-Up inputs
  north_star_review?: string
  accelerator_review?: string
  goal_alignment?: string
}

// Re-export Full Audit types for convenience
export type { FullAuditData, FullAuditResult, EngineResult } from './full-audit-analysis'

// Re-export Year Board types for convenience
export type { YearPlan, YearItem } from './year-board-types'
