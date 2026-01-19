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

// ============================================================================
// Framework Intelligence Types (Section 5)
// ============================================================================

/** The 5 DriverOS engines for business health diagnosis */
export type FrameworkEngineName = 'vision' | 'people' | 'operations' | 'revenue' | 'finance'

/** Business maturity gear (1-5 scale) */
export type GearNumber = 1 | 2 | 3 | 4 | 5

/** Action owner roles for assignment */
export type ActionOwner = 'CEO' | 'COO' | 'Sales' | 'Finance' | 'Operations' | 'HR'

/** Effort level for actions (1-5 scale) */
export type EffortLevel = 1 | 2 | 3 | 4 | 5

/** Flash scan answer strength */
export type AnswerStrength = 'strong' | 'partial' | 'weak'

/** Action priority level */
export type ActionPriority = 'do_now' | 'do_next'

/** Red flag severity */
export type FlagSeverity = 'critical' | 'warning'

/** Individual flash scan answer */
export interface FlashScanAnswer {
  questionId: number
  strength: AnswerStrength
  freeformResponse?: string // For question 6 (biggest constraint)
}

/** Result from a single question evaluation */
export interface QuestionResult {
  questionId: number
  pointsAwarded: number
  maxPoints: number
  affectedEngines: FrameworkEngineName[]
  triggeredFlags: string[]
}

/** Engine scores mapped by engine name */
export type EngineScores = Record<FrameworkEngineName, number>

/** A red flag indicating a business health issue */
export interface RedFlag {
  id: string
  engine: FrameworkEngineName
  description: string
  severity: FlagSeverity
  recommendedAction: string
  source: 'question' | 'engine_score'
  questionId?: number
}

/** A recommended action from the framework analysis */
export interface FrameworkAction {
  id: string
  title: string
  description: string
  priority: ActionPriority
  owner: ActionOwner
  effort: EffortLevel
  engine: FrameworkEngineName
  rationale: string
}

/** Complete result from framework flash scan analysis */
export interface FrameworkFlashScanResult {
  schemaVersion: string
  timestamp: string
  overallScore: number
  currentGear: GearNumber
  gearLabel: string
  gearReason: string
  engineScores: EngineScores
  questionResults: QuestionResult[]
  redFlags: RedFlag[]
  actions: FrameworkAction[]
  context?: {
    industry?: string
    sizeband?: string
    revenue?: number
    biggestConstraint?: string
  }
}

/** Input for action generation orchestrator */
export interface ActionGeneratorInput {
  engineScores: EngineScores
  overallScore: number
  questionResults: QuestionResult[]
  questionRedFlags: RedFlag[]
  currentGear: GearNumber
  isSmallBusiness: boolean
  biggestConstraint?: string
}
