/**
 * Actions Data Layer
 *
 * Provides unified access to actions (tasks/recommendations)
 * Works in both demo mode (localStorage) and production (Supabase)
 */

import { createClient } from '@/lib/supabase/client'
import { safeGetItem, safeSetItem } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/storage'
import { isDemoMode, generateId, now, getOrgId } from './utils'
import type {
  Action,
  InsertTables,
  UpdateTables,
  ActionStatus,
  ActionPriority,
  EngineName,
} from '@/lib/supabase/types'

// Demo mode action type (compatible with existing localStorage structure)
interface DemoAction {
  id: string
  title: string
  description?: string | null
  why?: string | null
  owner?: string | null
  engine?: EngineName | null
  priority: ActionPriority
  status: ActionStatus
  effort?: number | null
  due_date?: string | null
  source?: string | null
  created_at: string
  updated_at: string
}

function demoDatasource() {
  return {
    getAll(): DemoAction[] {
      return safeGetItem<DemoAction[]>(STORAGE_KEYS.IMPORTED_ACTIONS, [])
    },

    save(actions: DemoAction[]): void {
      safeSetItem(STORAGE_KEYS.IMPORTED_ACTIONS, actions)
    },
  }
}

export async function getActions(orgId?: string): Promise<Action[]> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const actions = demo.getAll()
    // Add org_id and created_by for type compatibility
    return actions.map((a) => ({
      ...a,
      org_id: getOrgId(orgId),
      created_by: 'demo-user',
      north_star_id: null,
      description: a.description ?? null,
      why: a.why ?? null,
      owner: a.owner ?? null,
      engine: a.engine ?? null,
      effort: a.effort ?? null,
      due_date: a.due_date ?? null,
      source: a.source ?? null,
    }))
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getActionById(id: string, orgId?: string): Promise<Action | null> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const actions = demo.getAll()
    const action = actions.find((a) => a.id === id)
    if (!action) return null
    return {
      ...action,
      org_id: getOrgId(orgId),
      created_by: 'demo-user',
      north_star_id: null,
      description: action.description ?? null,
      why: action.why ?? null,
      owner: action.owner ?? null,
      engine: action.engine ?? null,
      effort: action.effort ?? null,
      due_date: action.due_date ?? null,
      source: action.source ?? null,
    }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createAction(
  action: Omit<InsertTables<'actions'>, 'id' | 'org_id' | 'created_by' | 'created_at' | 'updated_at'>,
  orgId?: string,
  userId?: string
): Promise<Action> {
  const id = generateId()
  const timestamp = now()

  if (isDemoMode()) {
    const demo = demoDatasource()
    const actions = demo.getAll()
    const newAction: DemoAction = {
      id,
      title: action.title,
      description: action.description,
      why: action.why,
      owner: action.owner,
      engine: action.engine,
      priority: action.priority || 'do_next',
      status: action.status || 'not_started',
      effort: action.effort,
      due_date: action.due_date,
      source: action.source,
      created_at: timestamp,
      updated_at: timestamp,
    }
    demo.save([newAction, ...actions])
    return {
      ...newAction,
      org_id: getOrgId(orgId),
      created_by: userId || 'demo-user',
      north_star_id: action.north_star_id || null,
      description: newAction.description ?? null,
      why: newAction.why ?? null,
      owner: newAction.owner ?? null,
      engine: newAction.engine ?? null,
      effort: newAction.effort ?? null,
      due_date: newAction.due_date ?? null,
      source: newAction.source ?? null,
    }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('actions')
    .insert({
      ...action,
      org_id: getOrgId(orgId),
      created_by: userId || '',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAction(
  id: string,
  updates: UpdateTables<'actions'>
): Promise<Action> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const actions = demo.getAll()
    const index = actions.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('Action not found')

    const updated: DemoAction = {
      ...actions[index],
      ...updates,
      updated_at: now(),
    }
    actions[index] = updated
    demo.save(actions)
    return {
      ...updated,
      org_id: 'demo',
      created_by: 'demo-user',
      north_star_id: null,
      description: updated.description ?? null,
      why: updated.why ?? null,
      owner: updated.owner ?? null,
      engine: updated.engine ?? null,
      effort: updated.effort ?? null,
      due_date: updated.due_date ?? null,
      source: updated.source ?? null,
    }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('actions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAction(id: string): Promise<void> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const actions = demo.getAll()
    demo.save(actions.filter((a) => a.id !== id))
    return
  }

  const supabase = createClient()
  const { error } = await supabase.from('actions').delete().eq('id', id)

  if (error) throw error
}

export async function updateActionStatus(
  id: string,
  status: ActionStatus
): Promise<Action> {
  return updateAction(id, { status })
}

export async function getActionsByStatus(
  status: ActionStatus,
  orgId?: string
): Promise<Action[]> {
  const actions = await getActions(orgId)
  return actions.filter((a) => a.status === status)
}

export async function getActionsByEngine(
  engine: EngineName,
  orgId?: string
): Promise<Action[]> {
  const actions = await getActions(orgId)
  return actions.filter((a) => a.engine === engine)
}

export async function getActionsByPriority(
  priority: ActionPriority,
  orgId?: string
): Promise<Action[]> {
  const actions = await getActions(orgId)
  return actions.filter((a) => a.priority === priority)
}
