// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
/**
 * North Star Data Layer
 *
 * Provides access to North Star goals via Supabase
 */

import { createClient } from '@/lib/supabase/client'
import { generateId, now, getOrgId } from './utils'
import type {
  NorthStar,
  InsertTables,
  UpdateTables,
} from '@/lib/supabase/types'

export async function getActiveNorthStar(orgId?: string): Promise<NorthStar | null> {
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
  const supabase = createClient()
  const { error } = await supabase.from('north_stars').delete().eq('id', id)

  if (error) throw error
}
