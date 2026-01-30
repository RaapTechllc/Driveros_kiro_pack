// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
/**
 * Parked Ideas Data Layer
 *
 * Provides unified access to parked ideas
 * Works in both demo mode (localStorage) and production (Supabase)
 */

import { createClient } from '@/lib/supabase/client'
import { safeGetItem, safeSetItem } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/storage'
import { isDemoMode, generateId, now, getOrgId } from './utils'
import type { InsertTables, ParkedIdea } from '@/lib/supabase/types'

interface DemoParkedIdea {
  id: string
  title: string
  description: string | null
  reason: string | null
  created_at: string
}

function demoDatasource() {
  return {
    getAll(): DemoParkedIdea[] {
      return safeGetItem<DemoParkedIdea[]>(STORAGE_KEYS.PARKED_IDEAS, [])
    },

    save(ideas: DemoParkedIdea[]): void {
      safeSetItem(STORAGE_KEYS.PARKED_IDEAS, ideas)
    },
  }
}

export async function getParkedIdeas(orgId?: string): Promise<ParkedIdea[]> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    return demo.getAll().map((idea) => ({
      ...idea,
      org_id: getOrgId(orgId),
      created_by: 'demo-user',
    }))
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('parked_ideas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createParkedIdea(
  idea: Omit<InsertTables<'parked_ideas'>, 'id' | 'org_id' | 'created_at' | 'created_by'>,
  orgId?: string,
  userId?: string
): Promise<ParkedIdea> {
  const id = generateId()
  const timestamp = now()

  if (isDemoMode()) {
    const demo = demoDatasource()
    const ideas = demo.getAll()
    const newIdea: DemoParkedIdea = {
      id,
      title: idea.title,
      description: idea.description ?? null,
      reason: idea.reason ?? null,
      created_at: timestamp,
    }
    demo.save([newIdea, ...ideas])
    return {
      ...newIdea,
      org_id: getOrgId(orgId),
      created_by: userId || 'demo-user',
    }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('parked_ideas')
    .insert({
      ...idea,
      org_id: getOrgId(orgId),
      created_by: userId || '',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteParkedIdea(id: string): Promise<void> {
  if (isDemoMode()) {
    const demo = demoDatasource()
    const ideas = demo.getAll()
    demo.save(ideas.filter((idea) => idea.id !== id))
    return
  }

  const supabase = createClient()
  const { error } = await supabase.from('parked_ideas').delete().eq('id', id)
  if (error) throw error
}
