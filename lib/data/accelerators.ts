// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
/**
 * Accelerators Data Layer
 *
 * Provides access to accelerators (KPIs/metrics) via Supabase
 */

import { createClient } from '@/lib/supabase/client'
import { generateId, now, getOrgId } from './utils'
import type {
  Accelerator,
  AcceleratorHistory,
  InsertTables,
  UpdateTables,
} from '@/lib/supabase/types'

export async function getAccelerators(orgId?: string): Promise<Accelerator[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('accelerators')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAcceleratorById(
  id: string,
  orgId?: string
): Promise<Accelerator | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('accelerators')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createAccelerator(
  accelerator: Omit<InsertTables<'accelerators'>, 'id' | 'org_id' | 'created_at' | 'updated_at'>,
  orgId?: string
): Promise<Accelerator> {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('accelerators') as any)
    .insert({
      ...accelerator,
      org_id: getOrgId(orgId),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAccelerator(
  id: string,
  updates: UpdateTables<'accelerators'>
): Promise<Accelerator> {
  const supabase = createClient()
  const { data, error } = await (supabase
    .from('accelerators') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAccelerator(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('accelerators').delete().eq('id', id)

  if (error) throw error
}

export async function recordAcceleratorValue(
  acceleratorId: string,
  value: number
): Promise<AcceleratorHistory> {
  const supabase = createClient()

  // Update current value
  await (supabase
    .from('accelerators') as any)
    .update({ current_value: value })
    .eq('id', acceleratorId)

  // Add to history
  const { data, error } = await (supabase
    .from('accelerator_history') as any)
    .insert({
      accelerator_id: acceleratorId,
      value,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAcceleratorHistory(
  acceleratorId: string,
  limit = 30
): Promise<AcceleratorHistory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('accelerator_history')
    .select('*')
    .eq('accelerator_id', acceleratorId)
    .order('recorded_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
