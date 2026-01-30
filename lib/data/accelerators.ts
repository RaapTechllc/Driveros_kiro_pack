// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
/**
 * Accelerators Data Layer
 *
 * Provides unified access to accelerators (KPIs/metrics)
 * Works in both demo mode (localStorage) and production (Supabase)
 */

import { createClient } from '@/lib/supabase/client'
import { safeGetItem, safeSetItem } from '@/lib/storage'
import { isDemoMode, generateId, now, getOrgId } from './utils'
import type {
  Accelerator,
  AcceleratorHistory,
  InsertTables,
  UpdateTables,
} from '@/lib/supabase/types'

const ACCELERATOR_KEY = 'accelerators'
const ACCELERATOR_HISTORY_KEY = 'accelerator-history'

// Demo mode types
interface DemoAccelerator {
  id: string
  metric_name: string
  target_value: number | null
  current_value: number | null
  unit: string | null
  frequency: string | null
  created_at: string
  updated_at: string
}

interface DemoHistory {
  id: string
  accelerator_id: string
  value: number
  recorded_at: string
}

function demoDatasource() {
  return {
    getAll(): DemoAccelerator[] {
      const data = safeGetItem<DemoAccelerator[]>(ACCELERATOR_KEY, [])
      return data
    },

    save(accelerators: DemoAccelerator[]): void {
      safeSetItem(ACCELERATOR_KEY, accelerators)
    },

    getHistory(): DemoHistory[] {
      const data = safeGetItem<DemoHistory[]>(ACCELERATOR_HISTORY_KEY, [])
      return data
    },

    saveHistory(history: DemoHistory[]): void {
      safeSetItem(ACCELERATOR_HISTORY_KEY, history)
    },
  }
}

export async function getAccelerators(orgId?: string): Promise<Accelerator[]> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const accelerators = demo.getAll()
    return accelerators.map((a) => ({
      ...a,
      org_id: getOrgId(orgId),
    }))
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource()
    const accelerators = demo.getAll()
    const accelerator = accelerators.find((a) => a.id === id)
    if (!accelerator) return null
    return {
      ...accelerator,
      org_id: getOrgId(orgId),
    }
  }

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
  const id = generateId()
  const timestamp = now()

  if (isDemoMode()) {
    const demo = demoDatasource()
    const accelerators = demo.getAll()
    const newAccelerator: DemoAccelerator = {
      id,
      metric_name: accelerator.metric_name,
      target_value: accelerator.target_value ?? null,
      current_value: accelerator.current_value ?? null,
      unit: accelerator.unit ?? null,
      frequency: accelerator.frequency ?? null,
      created_at: timestamp,
      updated_at: timestamp,
    }
    demo.save([newAccelerator, ...accelerators])
    return {
      ...newAccelerator,
      org_id: getOrgId(orgId),
    }
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource()
    const accelerators = demo.getAll()
    const index = accelerators.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('Accelerator not found')

    const updated: DemoAccelerator = {
      ...accelerators[index],
      ...updates,
      updated_at: now(),
    }
    accelerators[index] = updated
    demo.save(accelerators)
    return {
      ...updated,
      org_id: 'demo',
    }
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource()
    const accelerators = demo.getAll()
    demo.save(accelerators.filter((a) => a.id !== id))
    // Also delete history
    const history = demo.getHistory()
    demo.saveHistory(history.filter((h) => h.accelerator_id !== id))
    return
  }

  const supabase = createClient()
  const { error } = await supabase.from('accelerators').delete().eq('id', id)

  if (error) throw error
}

export async function recordAcceleratorValue(
  acceleratorId: string,
  value: number
): Promise<AcceleratorHistory> {
  const id = generateId()
  const timestamp = now()

  if (isDemoMode()) {
    const demo = demoDatasource()

    // Update current value
    const accelerators = demo.getAll()
    const index = accelerators.findIndex((a) => a.id === acceleratorId)
    if (index !== -1) {
      accelerators[index] = {
        ...accelerators[index],
        current_value: value,
        updated_at: timestamp,
      }
      demo.save(accelerators)
    }

    // Add to history
    const history = demo.getHistory()
    const newEntry: DemoHistory = {
      id,
      accelerator_id: acceleratorId,
      value,
      recorded_at: timestamp,
    }
    demo.saveHistory([newEntry, ...history])

    return newEntry
  }

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
  if (isDemoMode()) {
    const demo = demoDatasource()
    const history = demo.getHistory()
    return history
      .filter((h) => h.accelerator_id === acceleratorId)
      .slice(0, limit)
  }

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
