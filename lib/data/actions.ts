// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
// NOTE: Targeted @ts-ignore comments used for Supabase insert/update operations
/**
 * Actions Data Layer
 *
 * Provides access to actions (tasks/recommendations) via Supabase
 */

import { createClient } from '@/lib/supabase/client'
import { generateId, now, getOrgId } from './utils'
import type {
  Action,
  InsertTables,
  UpdateTables,
  ActionStatus,
  ActionPriority,
  EngineName,
} from '@/lib/supabase/types'

export async function getActions(orgId?: string): Promise<Action[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getActionById(id: string, orgId?: string): Promise<Action | null> {
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
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('actions') as any)
    .insert({
      ...action,
      description: action.description ?? null,
      why: action.why ?? null,
      owner: action.owner ?? null,
      engine: action.engine ?? null,
      effort: action.effort ?? null,
      due_date: action.due_date ?? null,
      source: action.source ?? null,
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
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('actions') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAction(id: string): Promise<void> {
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
