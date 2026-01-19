/**
 * Pit Stop Planning
 * 
 * Weekly planning logic for Pit Stop meetings:
 * 1. Analyze last week's performance
 * 2. Generate next week's plan (max 3 actions)
 */

import { getActions } from '@/lib/data/actions'
import type { Action, ActionStatus } from '@/lib/supabase/types'

export interface WeeklySummary {
  completed: Action[]
  missed: Action[]
  totalActions: number
  completionRate: number
}

export interface WeeklyPlan {
  actions: Action[]
  rationale: string
}

/**
 * Get summary of actions from last 7 days
 */
export async function getLastWeekSummary(orgId: string): Promise<WeeklySummary> {
  const actions = await getActions(orgId)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  // Filter actions from last 7 days
  const lastWeekActions = actions.filter(action => {
    const createdAt = new Date(action.created_at)
    return createdAt >= sevenDaysAgo
  })
  
  const completed = lastWeekActions.filter(action => action.status === 'completed')
  const missed = lastWeekActions.filter(action => 
    action.status === 'not_started' || action.status === 'blocked'
  )
  
  return {
    completed,
    missed,
    totalActions: lastWeekActions.length,
    completionRate: lastWeekActions.length > 0 ? completed.length / lastWeekActions.length : 0
  }
}

/**
 * Generate weekly plan with max 3 actions
 * Rules: prioritize blockers, align to North Star, cap at 3
 */
export async function generateWeeklyPlan(
  summary: WeeklySummary, 
  northStar: string,
  orgId: string
): Promise<WeeklyPlan> {
  const allActions = await getActions(orgId)
  
  // Get available actions (not completed)
  const availableActions = allActions.filter(action => 
    action.status !== 'completed'
  )
  
  // Priority rules:
  // 1. Blocked actions first (unblock)
  // 2. do_now priority
  // 3. Actions with North Star alignment
  const blockedActions = availableActions.filter(a => a.status === 'blocked')
  const doNowActions = availableActions.filter(a => a.priority === 'do_now' && a.status !== 'blocked')
  const alignedActions = availableActions.filter(a => 
    a.north_star_id !== null && a.status !== 'blocked' && a.priority !== 'do_now'
  )
  
  // Select up to 3 actions
  const selectedActions: Action[] = []
  
  // Add blocked actions first
  selectedActions.push(...blockedActions.slice(0, 3))
  
  // Fill remaining slots with do_now
  if (selectedActions.length < 3) {
    const remaining = 3 - selectedActions.length
    selectedActions.push(...doNowActions.slice(0, remaining))
  }
  
  // Fill remaining slots with aligned actions
  if (selectedActions.length < 3) {
    const remaining = 3 - selectedActions.length
    selectedActions.push(...alignedActions.slice(0, remaining))
  }
  
  // Generate rationale
  let rationale = 'Focus on '
  if (blockedActions.length > 0) {
    rationale += 'unblocking stalled work'
  } else if (doNowActions.length > 0) {
    rationale += 'high-priority actions'
  } else {
    rationale += 'North Star alignment'
  }
  rationale += ` to advance: ${northStar}`
  
  return {
    actions: selectedActions,
    rationale
  }
}