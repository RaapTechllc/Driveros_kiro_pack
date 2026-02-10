// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
/**
 * Parked Ideas Data Layer
 *
 * Provides access to parked ideas via Supabase
 */

import { createClient } from '@/lib/supabase/client'
import { generateId, now, getOrgId } from './utils'
import type { InsertTables, ParkedIdea } from '@/lib/supabase/types'

export async function getParkedIdeas(orgId?: string): Promise<ParkedIdea[]> {
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
  const supabase = createClient()
  const { error } = await supabase.from('parked_ideas').delete().eq('id', id)
  if (error) throw error
}
