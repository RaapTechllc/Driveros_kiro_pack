/**
 * Company Memory System
 *
 * Accumulates knowledge about a company over time by processing events
 * from assessments, check-ins, actions, and meetings. This memory is
 * sent as context to the AI coach on every interaction.
 *
 * Storage: localStorage for demo mode, Supabase for production.
 */

import { safeGetItem, safeSetItem } from '@/lib/storage'
import type {
  CompanyMemory,
  MemoryEvent,
  TimelineEntry,
} from './types'
import type { FrameworkEngineName } from '@/lib/types'

const STORAGE_KEY = 'company-memory'
const CHAT_HISTORY_KEY = 'ai-chat-history'
const MAX_TIMELINE_ENTRIES = 50
const MAX_COACH_NOTES = 20
const MAX_RECURRING_BLOCKERS = 10
const MAX_RECENT_WINS = 10

// ============================================================================
// Create / Load / Save
// ============================================================================

export function createEmptyMemory(orgId: string): CompanyMemory {
  return {
    schemaVersion: 1,
    orgId,
    updatedAt: new Date().toISOString(),
    profile: {},
    engineSnapshot: {
      scores: {},
      trends: {},
      assessmentCount: 0,
    },
    actionInsights: {
      totalGenerated: 0,
      totalCompleted: 0,
      totalAbandoned: 0,
      strongEngines: [],
      weakEngines: [],
      activeOwners: [],
    },
    checkInInsights: {
      totalCheckIns: 0,
      currentStreak: 0,
      recurringBlockers: [],
      recentWins: [],
    },
    timeline: [],
    coachNotes: [],
  }
}

export function loadMemory(orgId: string): CompanyMemory {
  const stored = safeGetItem<CompanyMemory | null>(STORAGE_KEY, null)
  if (stored && stored.orgId === orgId && stored.schemaVersion === 1) {
    return stored
  }
  return createEmptyMemory(orgId)
}

export function saveMemory(memory: CompanyMemory): void {
  memory.updatedAt = new Date().toISOString()
  safeSetItem(STORAGE_KEY, memory)
}

// ============================================================================
// Chat History (separate from memory — raw message log)
// ============================================================================

import type { ChatMessage } from './types'

const MAX_CHAT_HISTORY = 100

export function loadChatHistory(orgId: string): ChatMessage[] {
  const stored = safeGetItem<{ orgId: string; messages: ChatMessage[] } | null>(CHAT_HISTORY_KEY, null)
  if (stored && stored.orgId === orgId) {
    return stored.messages
  }
  return []
}

export function saveChatHistory(orgId: string, messages: ChatMessage[]): void {
  // Keep only most recent messages
  const trimmed = messages.slice(-MAX_CHAT_HISTORY)
  safeSetItem(CHAT_HISTORY_KEY, { orgId, messages: trimmed })
}

// ============================================================================
// Memory Event Processing
// ============================================================================

export function processMemoryEvent(memory: CompanyMemory, event: MemoryEvent): CompanyMemory {
  // Clone to avoid mutation
  const m: CompanyMemory = JSON.parse(JSON.stringify(memory))
  const now = new Date().toISOString()

  switch (event.type) {
    case 'assessment_completed': {
      // Update engine scores
      for (const [engine, score] of Object.entries(event.scores)) {
        const prevScore = m.engineSnapshot.scores[engine as FrameworkEngineName]
        m.engineSnapshot.scores[engine as FrameworkEngineName] = score

        // Calculate trend
        if (prevScore === undefined) {
          m.engineSnapshot.trends[engine as FrameworkEngineName] = 'new'
        } else if (score - prevScore >= 5) {
          m.engineSnapshot.trends[engine as FrameworkEngineName] = 'up'
        } else if (prevScore - score >= 5) {
          m.engineSnapshot.trends[engine as FrameworkEngineName] = 'down'
        } else {
          m.engineSnapshot.trends[engine as FrameworkEngineName] = 'stable'
        }
      }

      m.engineSnapshot.assessmentCount += 1
      m.engineSnapshot.lastAssessmentDate = now

      if (event.gear) {
        const oldGear = m.profile.currentGear
        m.profile.currentGear = event.gear
        if (oldGear && oldGear !== event.gear) {
          addTimeline(m, {
            date: now,
            type: 'gear_change',
            summary: `Gear changed from ${oldGear} to ${event.gear}`,
          })
        }
      }

      addTimeline(m, {
        date: now,
        type: 'assessment',
        summary: `Completed ${event.assessmentType} assessment`,
      })
      break
    }

    case 'action_completed': {
      m.actionInsights.totalCompleted += 1

      if (event.engine) {
        // Track which engines the user is strong at completing
        if (!m.actionInsights.strongEngines.includes(event.engine)) {
          m.actionInsights.strongEngines.push(event.engine)
        }
        // Remove from weak if they completed one
        m.actionInsights.weakEngines = m.actionInsights.weakEngines.filter(e => e !== event.engine)
      }

      if (event.effort) {
        const prev = m.actionInsights.preferredEffort
        const completed = m.actionInsights.totalCompleted
        // Running average of effort level
        m.actionInsights.preferredEffort = prev
          ? (prev * (completed - 1) + event.effort) / completed
          : event.effort
      }

      addTimeline(m, {
        date: now,
        type: 'action_completed',
        summary: `Completed: ${event.actionTitle}`,
        engine: event.engine,
      })
      break
    }

    case 'action_abandoned': {
      m.actionInsights.totalAbandoned += 1

      if (event.engine && !m.actionInsights.weakEngines.includes(event.engine)) {
        m.actionInsights.weakEngines.push(event.engine)
      }

      addTimeline(m, {
        date: now,
        type: 'action_completed', // reuse type, summary distinguishes
        summary: `Abandoned: ${event.actionTitle}`,
        engine: event.engine,
      })
      break
    }

    case 'check_in': {
      m.checkInInsights.totalCheckIns += 1
      m.checkInInsights.currentStreak += 1

      if (event.blocker) {
        // Add to recurring blockers if not already tracked (simple dedup)
        const normalized = event.blocker.toLowerCase().trim()
        const existing = m.checkInInsights.recurringBlockers.find(
          b => b.toLowerCase().includes(normalized.slice(0, 20)) || normalized.includes(b.toLowerCase().slice(0, 20))
        )
        if (!existing) {
          m.checkInInsights.recurringBlockers.push(event.blocker)
          if (m.checkInInsights.recurringBlockers.length > MAX_RECURRING_BLOCKERS) {
            m.checkInInsights.recurringBlockers.shift()
          }
        }
      }

      if (event.win) {
        m.checkInInsights.recentWins.push(event.win)
        if (m.checkInInsights.recentWins.length > MAX_RECENT_WINS) {
          m.checkInInsights.recentWins.shift()
        }
      }

      addTimeline(m, {
        date: now,
        type: 'check_in',
        summary: event.win
          ? `Check-in: Won — ${event.win}`
          : event.blocker
            ? `Check-in: Blocked — ${event.blocker}`
            : 'Daily check-in completed',
      })
      break
    }

    case 'meeting_held': {
      addTimeline(m, {
        date: now,
        type: 'meeting',
        summary: `${event.meetingType} meeting${event.decisions.length ? `: ${event.decisions[0]}` : ''}`,
      })
      break
    }

    case 'north_star_changed': {
      m.profile.northStar = event.newGoal
      if (event.newConstraint) {
        m.profile.topConstraint = event.newConstraint
      }
      addTimeline(m, {
        date: now,
        type: 'north_star_change',
        summary: `North Star updated: ${event.newGoal}`,
      })
      break
    }

    case 'gear_changed': {
      m.profile.currentGear = event.newGear
      addTimeline(m, {
        date: now,
        type: 'gear_change',
        summary: `Moved from Gear ${event.oldGear} to Gear ${event.newGear}`,
      })
      break
    }

    case 'profile_updated': {
      if (event.industry) m.profile.industry = event.industry
      if (event.sizeBand) m.profile.sizeBand = event.sizeBand
      if (event.role) m.profile.role = event.role
      if (event.name) m.profile.name = event.name
      break
    }
  }

  m.updatedAt = now
  return m
}

// ============================================================================
// Helpers
// ============================================================================

function addTimeline(memory: CompanyMemory, entry: TimelineEntry): void {
  memory.timeline.push(entry)
  if (memory.timeline.length > MAX_TIMELINE_ENTRIES) {
    memory.timeline.shift()
  }
}

/**
 * Add a coach observation to the memory (called after AI generates insights)
 */
export function addCoachNote(memory: CompanyMemory, note: string): CompanyMemory {
  const m: CompanyMemory = JSON.parse(JSON.stringify(memory))
  m.coachNotes.push(note)
  if (m.coachNotes.length > MAX_COACH_NOTES) {
    m.coachNotes.shift()
  }
  m.updatedAt = new Date().toISOString()
  return m
}

/**
 * Build the memory from existing localStorage data.
 * Called on first load to bootstrap memory from existing assessments/check-ins.
 */
export function bootstrapMemoryFromStorage(orgId: string): CompanyMemory {
  let memory = createEmptyMemory(orgId)

  // Pull from existing Flash Scan result
  const flashResult = safeGetItem<Record<string, unknown> | null>('flash-scan-result', null)
  if (flashResult) {
    const data = flashResult as Record<string, unknown>

    // Extract profile info from flash scan data
    if (data.industry || data.size_band || data.role || data.north_star || data.top_constraint) {
      memory = processMemoryEvent(memory, {
        type: 'profile_updated',
        industry: data.industry as string | undefined,
        sizeBand: data.size_band as string | undefined,
        role: data.role as string | undefined,
      })
      if (data.north_star) {
        memory = processMemoryEvent(memory, {
          type: 'north_star_changed',
          newGoal: data.north_star as string,
          newConstraint: data.top_constraint as string | undefined,
        })
      }
    }

    // Extract scores if present
    const gear = data.gear_estimate as Record<string, unknown> | undefined
    if (gear?.number) {
      memory.profile.currentGear = gear.number as number as 1 | 2 | 3 | 4 | 5
    }
  }

  // Pull from Full Audit result
  const auditResult = safeGetItem<Record<string, unknown> | null>('full-audit-result', null)
  if (auditResult) {
    const engines = auditResult.engine_results as Array<{ engine: string; score: number }> | undefined
    if (engines) {
      const scores: Partial<Record<FrameworkEngineName, number>> = {}
      for (const e of engines) {
        scores[e.engine as FrameworkEngineName] = e.score
      }
      memory = processMemoryEvent(memory, {
        type: 'assessment_completed',
        assessmentType: 'full',
        scores,
        gear: (auditResult.gear as Record<string, unknown>)?.number as number as 1 | 2 | 3 | 4 | 5 | undefined,
      })
    }
  }

  // Pull from check-ins
  const checkIns = safeGetItem<Array<{ blocker?: string; win_or_lesson?: string }>>('check-ins', [])
  for (const ci of checkIns.slice(-10)) { // Only last 10 to keep bootstrap fast
    memory = processMemoryEvent(memory, {
      type: 'check_in',
      blocker: ci.blocker,
      win: ci.win_or_lesson,
    })
  }

  return memory
}
