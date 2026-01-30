// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
/**
 * North Star Data Layer
 *
 * Provides unified access to North Star goals
 * Works in both demo mode (localStorage) and production (Supabase)
 */

import { createClient } from '@/lib/supabase/client'
import { safeGetItem, safeSetItem } from '@/lib/storage'
import { isDemoMode, generateId, now, getOrgId } from './utils'
import type {
  NorthStar,
  InsertTables,
  UpdateTables,
} from '@/lib/supabase/types'

const NORTH_STAR_KEY = 'north-star'

// Demo mode type
interface DemoNorthStar {
  id: string
  goal: string
  vehicle: string | null
  constraint: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

function demoDatasource() {
  return {
    get(): DemoNorthStar | null {
      return safeGetItem<DemoNorthStar | null>(NORTH_STAR_KEY, null)
    },

    save(northStar: DemoNorthStar): void {
      safeSetItem(NORTH_STAR_KEY, northStar)
    },

    clear(): void {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(NORTH_STAR_KEY)
      }
    },
  }
}

export async function getActiveNorthStar(orgId?: string): Promise<NorthStar | null> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const northStar = demo.get()
    if (!northStar || !northStar.is_active) return null
    return {
      ...northStar,
      org_id: getOrgId(orgId),
    }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('north_stars')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function getAllNorthStars(orgId?: string): Promise<NorthStar[]> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const northStar = demo.get()
    if (!northStar) return []
    return [
      {
        ...northStar,
        org_id: getOrgId(orgId),
      },
    ]
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('north_stars')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getNorthStarById(
  id: string,
  orgId?: string
): Promise<NorthStar | null> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const northStar = demo.get()
    if (!northStar || northStar.id !== id) return null
    return {
      ...northStar,
      org_id: getOrgId(orgId),
    }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('north_stars')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createNorthStar(
  northStar: Omit<InsertTables<'north_stars'>, 'id' | 'org_id' | 'created_at' | 'updated_at'>,
  orgId?: string
): Promise<NorthStar> {
  const id = generateId()
  const timestamp = now()

  if (isDemoMode()) {
    const demo = demoDatasource()
    const newNorthStar: DemoNorthStar = {
      id,
      goal: northStar.goal,
      vehicle: northStar.vehicle ?? null,
      constraint: northStar.constraint ?? null,
      is_active: northStar.is_active ?? true,
      created_at: timestamp,
      updated_at: timestamp,
    }
    demo.save(newNorthStar)
    return {
      ...newNorthStar,
      org_id: getOrgId(orgId),
    }
  }

  // Deactivate existing north stars if creating a new active one
  if (northStar.is_active !== false) {
    const supabase = createClient()
    await supabase
      .from('north_stars')
      .update({ is_active: false })
      .eq('is_active', true)
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('north_stars')
    .insert({
      ...northStar,
      org_id: getOrgId(orgId),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateNorthStar(
  id: string,
  updates: UpdateTables<'north_stars'>
): Promise<NorthStar> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const northStar = demo.get()
    if (!northStar || northStar.id !== id) {
      throw new Error('North Star not found')
    }

    const updated: DemoNorthStar = {
      ...northStar,
      ...updates,
      updated_at: now(),
    }
    demo.save(updated)
    return {
      ...updated,
      org_id: 'demo',
    }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('north_stars')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function setActiveNorthStar(id: string): Promise<NorthStar> {
  if (isDemoMode()) {
    return updateNorthStar(id, { is_active: true })
  }

  const supabase = createClient()

  // Deactivate all other north stars
  await supabase
    .from('north_stars')
    .update({ is_active: false })
    .neq('id', id)

  // Activate this one
  return updateNorthStar(id, { is_active: true })
}

export async function deleteNorthStar(id: string): Promise<void> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const northStar = demo.get()
    if (northStar && northStar.id === id) {
      demo.clear()
    }
    return
  }

  const supabase = createClient()
  const { error } = await supabase.from('north_stars').delete().eq('id', id)

  if (error) throw error
}
