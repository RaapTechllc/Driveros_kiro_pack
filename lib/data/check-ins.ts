/**
 * Check-ins Data Layer
 *
 * Provides unified access to daily check-ins
 * Works in both demo mode (localStorage) and production (Supabase)
 */

import { createClient } from '@/lib/supabase/client'
import { safeGetItem, safeSetItem } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/storage'
import { isDemoMode, generateId, now, getOrgId } from './utils'
import type { CheckIn, InsertTables, UpdateTables } from '@/lib/supabase/types'

interface DemoCheckIn {
  id: string
  date: string
  actions_completed: boolean | null
  blocker: string | null
  win_or_lesson: string | null
  action_updates: any | null
  created_at: string
}

function demoDatasource() {
  return {
    getAll(): DemoCheckIn[] {
      const data = safeGetItem<DemoCheckIn[]>(STORAGE_KEYS.CHECK_INS, [])
      return data
    },

    save(checkIns: DemoCheckIn[]): void {
      safeSetItem(STORAGE_KEYS.CHECK_INS, checkIns)
    },
  }
}

export async function getTodayCheckIn(orgId: string, userId: string): Promise<CheckIn | null> {
  const today = new Date().toISOString().split('T')[0]

  if (isDemoMode()) {
    const demo = demoDatasource()
    const checkIns = demo.getAll()
    const todayCheckIn = checkIns.find((c) => c.date === today)
    if (!todayCheckIn) return null
    return {
      ...todayCheckIn,
      org_id: getOrgId(orgId),
      user_id: userId,
    }
  }

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
  const id = generateId()
  const timestamp = now()

  if (isDemoMode()) {
    const demo = demoDatasource()
    const checkIns = demo.getAll()
    const newCheckIn: DemoCheckIn = {
      id,
      date: checkIn.date,
      actions_completed: checkIn.actions_completed ?? null,
      blocker: checkIn.blocker ?? null,
      win_or_lesson: checkIn.win_or_lesson ?? null,
      action_updates: checkIn.action_updates ?? null,
      created_at: timestamp,
    }
    demo.save([newCheckIn, ...checkIns])
    return {
      ...newCheckIn,
      org_id: getOrgId(orgId),
      user_id: userId || 'demo-user',
    }
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource()
    const checkIns = demo.getAll()
    const index = checkIns.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Check-in not found')

    const updated: DemoCheckIn = {
      ...checkIns[index],
      ...updates,
    }
    checkIns[index] = updated
    demo.save(checkIns)
    return {
      ...updated,
      org_id: 'demo',
      user_id: 'demo-user',
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