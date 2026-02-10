// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
/**
 * Check-ins Data Layer
 *
 * Provides access to daily check-ins via Supabase
 */

import { createClient } from '@/lib/supabase/client'
import { generateId, now, getOrgId } from './utils'
import type { CheckIn, InsertTables, UpdateTables } from '@/lib/supabase/types'

export async function getTodayCheckIn(orgId: string, userId: string): Promise<CheckIn | null> {
  const today = new Date().toISOString().split('T')[0]

  const supabase = createClient()
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function createCheckIn(
  checkIn: Omit<InsertTables<'check_ins'>, 'id' | 'created_at'>,
  orgId?: string,
  userId?: string
): Promise<CheckIn> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('check_ins')
    .insert(checkIn)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCheckIn(
  id: string,
  updates: UpdateTables<'check_ins'>
): Promise<CheckIn> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('check_ins')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}