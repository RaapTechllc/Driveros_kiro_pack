// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
/**
 * Assessments Data Layer
 *
 * Provides access to assessments (flash scan, full audit, apex audit) via Supabase
 */

import { createClient } from '@/lib/supabase/client'
import { generateId, now, getOrgId } from './utils'
import type {
  Assessment,
  InsertTables,
  AssessmentType,
  Json,
} from '@/lib/supabase/types'

export async function getLatestAssessment(
  type: AssessmentType,
  orgId?: string
): Promise<Assessment | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data || null
}

export async function getAllAssessments(
  type?: AssessmentType,
  orgId?: string
): Promise<Assessment[]> {
  const supabase = createClient()
  let query = supabase
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function saveAssessment(
  type: AssessmentType,
  data: Json,
  orgId?: string,
  userId?: string
): Promise<Assessment> {
  const supabase = createClient()
  const { data: savedData, error } = await supabase
    .from('assessments')
    .insert({
      type,
      data,
      org_id: getOrgId(orgId),
      created_by: userId || '',
    })
    .select()
    .single()

  if (error) throw error
  return savedData
}

export async function getFlashScanResult(orgId?: string): Promise<Json | null> {
  const assessment = await getLatestAssessment('flash_scan', orgId)
  return assessment?.data || null
}

export async function saveFlashScanResult(
  data: Json,
  orgId?: string,
  userId?: string
): Promise<Assessment> {
  return saveAssessment('flash_scan', data, orgId, userId)
}

export async function getFullAuditResult(orgId?: string): Promise<Json | null> {
  const assessment = await getLatestAssessment('full_audit', orgId)
  return assessment?.data || null
}

export async function saveFullAuditResult(
  data: Json,
  orgId?: string,
  userId?: string
): Promise<Assessment> {
  return saveAssessment('full_audit', data, orgId, userId)
}

export async function getApexAuditResult(orgId?: string): Promise<Json | null> {
  const assessment = await getLatestAssessment('apex_audit', orgId)
  return assessment?.data || null
}

export async function saveApexAuditResult(
  data: Json,
  orgId?: string,
  userId?: string
): Promise<Assessment> {
  return saveAssessment('apex_audit', data, orgId, userId)
}
