// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
/**
 * Year Plan Data Layer
 *
 * Provides unified access to year plans and items
 * Works in both demo mode (localStorage) and production (Supabase)
 */

import { createClient } from '@/lib/supabase/client'
import { safeGetItem, safeSetItem } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/storage'
import { isDemoMode, generateId, now, getOrgId } from './utils'
import type {
  YearPlan,
  YearItem,
  InsertTables,
  UpdateTables,
} from '@/lib/supabase/types'

// Demo mode types (matching existing localStorage structure)
interface DemoYearPlan {
  id: string
  year: number
  north_star_id: string | null
  created_at: string
  updated_at: string
}

interface DemoYearItem {
  id: string
  year_plan_id: string
  type: string
  title: string
  department: string | null
  quarter: number
  status: string
  rationale: string | null
  alignment_status: string | null
  created_at: string
  updated_at: string
}

function getYearPlanKey(year: number): string {
  return `${STORAGE_KEYS.YEAR_PLAN}-${year}`
}

function getYearItemsKey(year: number): string {
  return `${STORAGE_KEYS.YEAR_ITEMS}-${year}`
}

function demoDatasource(year: number) {
  return {
    getPlan(): DemoYearPlan | null {
      return safeGetItem<DemoYearPlan | null>(getYearPlanKey(year), null)
    },

    savePlan(plan: DemoYearPlan): void {
      safeSetItem(getYearPlanKey(year), plan)
    },

    getItems(): DemoYearItem[] {
      return safeGetItem<DemoYearItem[]>(getYearItemsKey(year), [])
    },

    saveItems(items: DemoYearItem[]): void {
      safeSetItem(getYearItemsKey(year), items)
    },

    deletePlan(): void {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(getYearPlanKey(year))
        localStorage.removeItem(getYearItemsKey(year))
      }
    },
  }
}

// ===========================================
// YEAR PLANS
// ===========================================

export async function getYearPlan(
  year: number,
  orgId?: string
): Promise<YearPlan | null> {
  if (isDemoMode()) {
    const demo = demoDatasource(year)
    const plan = demo.getPlan()
    if (!plan) return null
    return {
      ...plan,
      org_id: getOrgId(orgId),
      created_by: 'demo-user',
    }
  }

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
  if (isDemoMode()) {
    // In demo mode, check last 5 years
    const currentYear = new Date().getFullYear()
    const plans: YearPlan[] = []
    for (let y = currentYear; y >= currentYear - 5; y--) {
      const demo = demoDatasource(y)
      const plan = demo.getPlan()
      if (plan) {
        plans.push({
          ...plan,
          org_id: getOrgId(orgId),
          created_by: 'demo-user',
        })
      }
    }
    return plans
  }

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
  const id = generateId()
  const timestamp = now()

  if (isDemoMode()) {
    const demo = demoDatasource(year)
    const newPlan: DemoYearPlan = {
      id,
      year,
      north_star_id: northStarId || null,
      created_at: timestamp,
      updated_at: timestamp,
    }
    demo.savePlan(newPlan)
    return {
      ...newPlan,
      org_id: getOrgId(orgId),
      created_by: userId || 'demo-user',
    }
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource(year)
    const plan = demo.getPlan()
    if (!plan || plan.id !== id) {
      throw new Error('Year plan not found')
    }

    const updated: DemoYearPlan = {
      ...plan,
      ...updates,
      updated_at: now(),
    }
    demo.savePlan(updated)
    return {
      ...updated,
      org_id: 'demo',
      created_by: 'demo-user',
    }
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource(year)
    demo.deletePlan()
    return
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource(year)
    const items = demo.getItems()
    return items
      .filter((i) => i.year_plan_id === yearPlanId)
      .map((i) => ({
        ...i,
        created_by: 'demo-user',
      }))
  }

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
  const id = generateId()
  const timestamp = now()

  if (isDemoMode()) {
    const demo = demoDatasource(year)
    const items = demo.getItems()
    const newItem: DemoYearItem = {
      id,
      year_plan_id: item.year_plan_id,
      type: item.type,
      title: item.title,
      department: item.department ?? null,
      quarter: item.quarter,
      status: item.status || 'planned',
      rationale: item.rationale ?? null,
      alignment_status: item.alignment_status ?? null,
      created_at: timestamp,
      updated_at: timestamp,
    }
    demo.saveItems([...items, newItem])
    return {
      ...newItem,
      created_by: userId || 'demo-user',
    }
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource(year)
    const items = demo.getItems()
    const index = items.findIndex((i) => i.id === id)
    if (index === -1) throw new Error('Year item not found')

    const updated: DemoYearItem = {
      ...items[index],
      ...updates,
      updated_at: now(),
    }
    items[index] = updated
    demo.saveItems(items)
    return {
      ...updated,
      created_by: 'demo-user',
    }
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource(year)
    const items = demo.getItems()
    demo.saveItems(items.filter((i) => i.id !== id))
    return
  }

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
