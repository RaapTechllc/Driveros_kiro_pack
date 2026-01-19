import type { Action, ActionPriority, ActionStatus, EngineName } from '@/lib/supabase/types'
import type { NorthStar } from '@/lib/supabase/types'

export interface DraftPlanAction {
  title: string
  why: string
  owner: string | null
  engine: EngineName | null
  priority: ActionPriority
  effort?: number | null
}

const ACTIVE_STATUSES: ActionStatus[] = ['not_started', 'in_progress', 'blocked']

export function generateWeeklyPlan(
  actions: Action[],
  northStar: NorthStar | null
): DraftPlanAction[] {
  const active = actions
    .filter((action) => ACTIVE_STATUSES.includes(action.status))
    .slice(0, 3)

  if (active.length > 0) {
    return active.map((action) => ({
      title: action.title,
      why: action.why || 'Carry forward for focused execution this week.',
      owner: action.owner || null,
      engine: action.engine || null,
      priority: action.status === 'blocked' ? 'do_now' : action.priority,
      effort: action.effort ?? null,
    }))
  }

  if (northStar) {
    return [{
      title: `Advance North Star: ${northStar.goal}`,
      why: 'Keep the weekly focus aligned to the North Star.',
      owner: 'Owner',
      engine: 'vision',
      priority: 'do_now',
      effort: 2,
    }]
  }

  return []
}
