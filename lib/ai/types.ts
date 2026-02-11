/**
 * AI Coach Types
 *
 * Types for the company memory system, chat messages, and page-aware context
 * that powers the DriverOS AI coaching agent.
 */

import type { FrameworkEngineName, GearNumber, ActionPriority } from '@/lib/types'

// ============================================================================
// Chat Messages
// ============================================================================

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  /** Which page the user was on when this message was sent */
  pageContext?: PageContext
}

export interface ChatSession {
  id: string
  orgId: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Page Context - tells the AI what the user is currently looking at
// ============================================================================

export type PageId =
  | 'dashboard'
  | 'flash-scan'
  | 'full-audit'
  | 'apex-audit'
  | 'check-in'
  | 'pit-stop'
  | 'meetings'
  | 'year-board'
  | 'actions'
  | 'settings'
  | 'onboarding'
  | 'import'
  | 'parked-ideas'
  | 'performance'
  | 'pricing'
  | 'help'
  | 'landing'
  | 'unknown'

export interface PageContext {
  pageId: PageId
  /** Human-readable description of what the user is doing */
  description: string
  /** Any relevant data visible on the current page (scores, form state, etc.) */
  visibleData?: Record<string, unknown>
}

// ============================================================================
// Company Memory - accumulated knowledge about the business
// ============================================================================

export interface CompanyMemory {
  schemaVersion: 1
  orgId: string
  updatedAt: string

  /** Company profile basics */
  profile: {
    name?: string
    industry?: string
    sizeBand?: string
    currentGear?: GearNumber
    northStar?: string
    topConstraint?: string
    role?: string
  }

  /** Latest engine scores + trend summary */
  engineSnapshot: {
    scores: Partial<Record<FrameworkEngineName, number>>
    trends: Partial<Record<FrameworkEngineName, 'up' | 'down' | 'stable' | 'new'>>
    lastAssessmentDate?: string
    assessmentCount: number
  }

  /** What we've learned from their actions */
  actionInsights: {
    totalGenerated: number
    totalCompleted: number
    totalAbandoned: number
    /** Engines where they complete actions most */
    strongEngines: FrameworkEngineName[]
    /** Engines where actions get abandoned/blocked */
    weakEngines: FrameworkEngineName[]
    /** Average effort level of completed actions */
    preferredEffort?: number
    /** Owners who complete the most */
    activeOwners: string[]
  }

  /** Patterns from check-ins */
  checkInInsights: {
    totalCheckIns: number
    currentStreak: number
    /** Most commonly mentioned blockers (deduplicated themes) */
    recurringBlockers: string[]
    /** Recent wins */
    recentWins: string[]
  }

  /** Key events and decisions (append-only log, max 50 entries) */
  timeline: TimelineEntry[]

  /** Free-form notes the AI has generated about this company */
  coachNotes: string[]
}

export interface TimelineEntry {
  date: string
  type: 'assessment' | 'action_completed' | 'check_in' | 'meeting' | 'gear_change' | 'north_star_change' | 'coach_observation'
  summary: string
  engine?: FrameworkEngineName
}

// ============================================================================
// AI API Request/Response
// ============================================================================

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
  pageContext: PageContext
  memory: CompanyMemory
  /** If true, the AI should proactively offer a nudge based on context */
  isProactiveNudge?: boolean
}

export interface ChatStreamChunk {
  type: 'text' | 'done' | 'error'
  content: string
}

// ============================================================================
// Memory update events - fired by app to keep memory current
// ============================================================================

export type MemoryEvent =
  | { type: 'assessment_completed'; assessmentType: 'flash' | 'full' | 'apex'; scores: Partial<Record<FrameworkEngineName, number>>; gear?: GearNumber }
  | { type: 'action_completed'; actionTitle: string; engine?: FrameworkEngineName; effort?: number }
  | { type: 'action_abandoned'; actionTitle: string; engine?: FrameworkEngineName }
  | { type: 'check_in'; blocker?: string; win?: string }
  | { type: 'meeting_held'; meetingType: string; decisions: string[] }
  | { type: 'north_star_changed'; newGoal: string; newConstraint?: string }
  | { type: 'gear_changed'; oldGear: GearNumber; newGear: GearNumber }
  | { type: 'profile_updated'; industry?: string; sizeBand?: string; role?: string; name?: string }
