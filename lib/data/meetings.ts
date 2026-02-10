// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
/**
 * Meetings Data Layer
 *
 * Provides access to meetings (warm-up, pit stop, full tune-up, check-in)
 * and check-ins via Supabase
 */

import { createClient } from '@/lib/supabase/client'
import { generateId, now, getOrgId } from './utils'
import type {
  Meeting,
  CheckIn,
  InsertTables,
  UpdateTables,
  MeetingType,
  Json,
} from '@/lib/supabase/types'

// ===========================================
// MEETINGS
// ===========================================

export async function getMeetings(orgId?: string): Promise<Meeting[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getMeetingsByType(
  type: MeetingType,
  orgId?: string
): Promise<Meeting[]> {
  const meetings = await getMeetings(orgId)
  return meetings.filter((m) => m.type === type)
}

export async function getMeetingById(
  id: string,
  orgId?: string
): Promise<Meeting | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createMeeting(
  meeting: Omit<InsertTables<'meetings'>, 'id' | 'org_id' | 'created_by' | 'created_at' | 'updated_at'>,
  orgId?: string,
  userId?: string
): Promise<Meeting> {
  let resolvedUserId = userId
  if (!resolvedUserId) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    resolvedUserId = data.user?.id
  }

  if (!resolvedUserId) {
    throw new Error('Missing user id for meeting creation')
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      ...meeting,
      org_id: getOrgId(orgId),
      created_by: resolvedUserId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMeeting(
  id: string,
  updates: UpdateTables<'meetings'>
): Promise<Meeting> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('meetings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function completeMeeting(
  id: string,
  notes?: string,
  decisions?: Json,
  actionIds?: string[]
): Promise<Meeting> {
  return updateMeeting(id, {
    completed_at: now(),
    notes,
    decisions,
    action_ids: actionIds,
  })
}

export async function deleteMeeting(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('meetings').delete().eq('id', id)

  if (error) throw error
}

// ===========================================
// CHECK-INS
// ===========================================

export async function getCheckIns(orgId?: string): Promise<CheckIn[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getCheckInByDate(
  date: string,
  userId?: string,
  orgId?: string
): Promise<CheckIn | null> {
  const supabase = createClient()
  let query = supabase.from('check_ins').select('*').eq('date', date)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query.single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function createCheckIn(
  checkIn: Omit<InsertTables<'check_ins'>, 'id' | 'org_id' | 'created_at'>,
  orgId?: string
): Promise<CheckIn> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      ...checkIn,
      org_id: getOrgId(orgId),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCheckIn(
  id: string,
  updates: UpdateTables<'check_ins'>,
  orgId?: string
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

export async function getTodayCheckIn(
  userId: string,
  orgId?: string
): Promise<CheckIn | null> {
  const today = new Date().toISOString().split('T')[0]
  return getCheckInByDate(today, userId, orgId)
}
