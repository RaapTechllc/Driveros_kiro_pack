// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
/**
 * Year Plan Data Layer
 *
 * Provides access to year plans and items via Supabase
 */

import { createClient } from '@/lib/supabase/client'
import { generateId, now, getOrgId } from './utils'
import type {
  YearPlan,
  YearItem,
  InsertTables,
  UpdateTables,
} from '@/lib/supabase/types'

// ===========================================
// YEAR PLANS
// ===========================================

export async function getYearPlan(
  year: number,
  orgId?: string
): Promise<YearPlan | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('year_plans')
    .select('*')
    .eq('year', year)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function getAllYearPlans(orgId?: string): Promise<YearPlan[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('year_plans')
    .select('*')
    .order('year', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createYearPlan(
  year: number,
  northStarId?: string | null,
  orgId?: string,
  userId?: string
): Promise<YearPlan> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('year_plans')
    .insert({
      year,
      north_star_id: northStarId,
      org_id: getOrgId(orgId),
      created_by: userId || '',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateYearPlan(
  id: string,
  year: number,
  updates: UpdateTables<'year_plans'>
): Promise<YearPlan> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('year_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteYearPlan(id: string, year: number): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('year_plans').delete().eq('id', id)

  if (error) throw error
}

// ===========================================
// YEAR ITEMS
// ===========================================

export async function getYearItems(
  yearPlanId: string,
  year: number
): Promise<YearItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('year_items')
    .select('*')
    .eq('year_plan_id', yearPlanId)
    .order('quarter', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getYearItemsByQuarter(
  yearPlanId: string,
  quarter: number,
  year: number
): Promise<YearItem[]> {
  const items = await getYearItems(yearPlanId, year)
  return items.filter((i) => i.quarter === quarter)
}

export async function createYearItem(
  item: Omit<InsertTables<'year_items'>, 'id' | 'created_by' | 'created_at' | 'updated_at'>,
  year: number,
  userId?: string
): Promise<YearItem> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('year_items')
    .insert({
      ...item,
      created_by: userId || '',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateYearItem(
  id: string,
  year: number,
  updates: UpdateTables<'year_items'>
): Promise<YearItem> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('year_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteYearItem(id: string, year: number): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('year_items').delete().eq('id', id)

  if (error) throw error
}

export async function moveYearItem(
  id: string,
  year: number,
  newQuarter: number
): Promise<YearItem> {
  return updateYearItem(id, year, { quarter: newQuarter })
}

export async function updateYearItemStatus(
  id: string,
  year: number,
  status: string
): Promise<YearItem> {
  return updateYearItem(id, year, { status })
}
