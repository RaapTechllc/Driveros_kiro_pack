/**
 * Memory Event Helpers
 *
 * Standalone functions for firing memory events from non-hook contexts
 * (e.g., API routes, data layer utilities, event handlers).
 *
 * For React components, use the useMemoryEvent() hook instead.
 */

import type { MemoryEvent } from './types'
import type { FrameworkEngineName, GearNumber } from '@/lib/types'
import { loadMemory, saveMemory, processMemoryEvent } from './memory'

/**
 * Fire a memory event for a specific org.
 * Loads memory, processes the event, saves it back.
 */
export function fireMemoryEvent(orgId: string, event: MemoryEvent): void {
  const memory = loadMemory(orgId)
  const updated = processMemoryEvent(memory, event)
  saveMemory(updated)
}

/** Helper: fire assessment_completed */
export function fireAssessmentCompleted(
  orgId: string,
  assessmentType: 'flash' | 'full' | 'apex',
  scores: Partial<Record<FrameworkEngineName, number>>,
  gear?: GearNumber
): void {
  fireMemoryEvent(orgId, {
    type: 'assessment_completed',
    assessmentType,
    scores,
    gear,
  })
}

/** Helper: fire action_completed */
export function fireActionCompleted(
  orgId: string,
  actionTitle: string,
  engine?: FrameworkEngineName,
  effort?: number
): void {
  fireMemoryEvent(orgId, {
    type: 'action_completed',
    actionTitle,
    engine,
    effort,
  })
}

/** Helper: fire action_abandoned */
export function fireActionAbandoned(
  orgId: string,
  actionTitle: string,
  engine?: FrameworkEngineName
): void {
  fireMemoryEvent(orgId, {
    type: 'action_abandoned',
    actionTitle,
    engine,
  })
}

/** Helper: fire check_in */
export function fireCheckIn(
  orgId: string,
  blocker?: string,
  win?: string
): void {
  fireMemoryEvent(orgId, {
    type: 'check_in',
    blocker,
    win,
  })
}

/** Helper: fire meeting_held */
export function fireMeetingHeld(
  orgId: string,
  meetingType: string,
  decisions: string[]
): void {
  fireMemoryEvent(orgId, {
    type: 'meeting_held',
    meetingType,
    decisions,
  })
}

/** Helper: fire north_star_changed */
export function fireNorthStarChanged(
  orgId: string,
  newGoal: string,
  newConstraint?: string
): void {
  fireMemoryEvent(orgId, {
    type: 'north_star_changed',
    newGoal,
    newConstraint,
  })
}

/** Helper: fire profile_updated */
export function fireProfileUpdated(
  orgId: string,
  updates: { industry?: string; sizeBand?: string; role?: string; name?: string }
): void {
  fireMemoryEvent(orgId, {
    type: 'profile_updated',
    ...updates,
  })
}
