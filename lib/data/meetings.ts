/**
 * Meetings Data Layer
 *
 * Provides unified access to meetings (warm-up, pit stop, full tune-up, check-in)
 * Works in both demo mode (localStorage) and production (Supabase)
 */

import { createClient } from '@/lib/supabase/client'
import { safeGetItem, safeSetItem } from '@/lib/storage'
import { isDemoMode, generateId, now, getOrgId } from './utils'
import type {
  Meeting,
  CheckIn,
  InsertTables,
  UpdateTables,
  MeetingType,
  Json,
} from '@/lib/supabase/types'

const MEETINGS_KEY = 'meetings'
const CHECK_INS_KEY = 'check-ins'

// Demo mode types
interface DemoMeeting {
  id: string
  type: MeetingType
  scheduled_for: string | null
  completed_at: string | null
  notes: string | null
  decisions: Json | null
  action_ids: string[] | null
  created_at: string
  updated_at: string
}

interface DemoCheckIn {
  id: string
  user_id: string
  date: string
  actions_completed: boolean | null
  blocker: string | null
  win_or_lesson: string | null
  action_updates: Json | null
  created_at: string
  updated_at: string
}

function demoDatasource() {
  return {
    getMeetings(): DemoMeeting[] {
      const data = safeGetItem<DemoMeeting[]>(MEETINGS_KEY)
      return data.success && data.data ? data.data : []
    },

    saveMeetings(meetings: DemoMeeting[]): void {
      safeSetItem(MEETINGS_KEY, meetings)
    },

    getCheckIns(): DemoCheckIn[] {
      const data = safeGetItem<DemoCheckIn[]>(CHECK_INS_KEY)
      return data.success && data.data ? data.data : []
    },

    saveCheckIns(checkIns: DemoCheckIn[]): void {
      safeSetItem(CHECK_INS_KEY, checkIns)
    },
  }
}

// ===========================================
// MEETINGS
// ===========================================

export async function getMeetings(orgId?: string): Promise<Meeting[]> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const meetings = demo.getMeetings()
    return meetings.map((m) => ({
      ...m,
      org_id: getOrgId(orgId),
      created_by: 'demo-user',
    }))
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource()
    const meetings = demo.getMeetings()
    const meeting = meetings.find((m) => m.id === id)
    if (!meeting) return null
    return {
      ...meeting,
      org_id: getOrgId(orgId),
      created_by: 'demo-user',
    }
  }

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
  const id = generateId()
  const timestamp = now()

  if (isDemoMode()) {
    const demo = demoDatasource()
    const meetings = demo.getMeetings()
    const newMeeting: DemoMeeting = {
      id,
      type: meeting.type,
      scheduled_for: meeting.scheduled_for ?? null,
      completed_at: meeting.completed_at ?? null,
      notes: meeting.notes ?? null,
      decisions: meeting.decisions ?? null,
      action_ids: meeting.action_ids ?? null,
      created_at: timestamp,
      updated_at: timestamp,
    }
    demo.saveMeetings([newMeeting, ...meetings])
    return {
      ...newMeeting,
      org_id: getOrgId(orgId),
      created_by: userId || 'demo-user',
    }
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource()
    const meetings = demo.getMeetings()
    const index = meetings.findIndex((m) => m.id === id)
    if (index === -1) throw new Error('Meeting not found')

    const updated: DemoMeeting = {
      ...meetings[index],
      ...updates,
      updated_at: now(),
    }
    meetings[index] = updated
    demo.saveMeetings(meetings)
    return {
      ...updated,
      org_id: 'demo',
      created_by: 'demo-user',
    }
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource()
    const meetings = demo.getMeetings()
    demo.saveMeetings(meetings.filter((m) => m.id !== id))
    return
  }

  const supabase = createClient()
  const { error } = await supabase.from('meetings').delete().eq('id', id)

  if (error) throw error
}

// ===========================================
// CHECK-INS
// ===========================================

export async function getCheckIns(orgId?: string): Promise<CheckIn[]> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const checkIns = demo.getCheckIns()
    return checkIns.map((c) => ({
      ...c,
      org_id: getOrgId(orgId),
    }))
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource()
    const checkIns = demo.getCheckIns()
    const checkIn = checkIns.find(
      (c) => c.date === date && (!userId || c.user_id === userId)
    )
    if (!checkIn) return null
    return {
      ...checkIn,
      org_id: getOrgId(orgId),
    }
  }

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
  const id = generateId()
  const timestamp = now()

  if (isDemoMode()) {
    const demo = demoDatasource()
    const checkIns = demo.getCheckIns()
    const newCheckIn: DemoCheckIn = {
      id,
      user_id: checkIn.user_id,
      date: checkIn.date,
      actions_completed: checkIn.actions_completed ?? null,
      blocker: checkIn.blocker ?? null,
      win_or_lesson: checkIn.win_or_lesson ?? null,
      action_updates: checkIn.action_updates ?? null,
      created_at: timestamp,
      updated_at: timestamp,
    }
    demo.saveCheckIns([newCheckIn, ...checkIns])
    return {
      ...newCheckIn,
      org_id: getOrgId(orgId),
    }
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource()
    const checkIns = demo.getCheckIns()
    const index = checkIns.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Check-in not found')

    const updated: DemoCheckIn = {
      ...checkIns[index],
      ...updates,
      created_at: checkIns[index].created_at,
      updated_at: now(),
    }
    checkIns[index] = updated
    demo.saveCheckIns(checkIns)
    return {
      ...updated,
      org_id: getOrgId(orgId),
    }
  }

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
