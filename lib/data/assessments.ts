// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
/**
 * Assessments Data Layer
 *
 * Provides unified access to assessments (flash scan, full audit, apex audit)
 * Works in both demo mode (localStorage) and production (Supabase)
 */

import { createClient } from '@/lib/supabase/client'
import { safeGetItem, safeSetItem } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/storage'
import { isDemoMode, generateId, now, getOrgId } from './utils'
import type {
  Assessment,
  InsertTables,
  AssessmentType,
  Json,
} from '@/lib/supabase/types'

function getStorageKey(type: AssessmentType): string {
  switch (type) {
    case 'flash_scan':
      return STORAGE_KEYS.FLASH_SCAN_RESULT
    case 'full_audit':
      return STORAGE_KEYS.FULL_AUDIT_RESULT
    case 'apex_audit':
      return STORAGE_KEYS.APEX_AUDIT_RESULT
    default:
      throw new Error(`Unknown assessment type: ${type}`)
  }
}

export async function getLatestAssessment(
  type: AssessmentType,
  orgId?: string
): Promise<Assessment | null> {
  if (isDemoMode()) {
    const key = getStorageKey(type)
    const data = safeGetItem<Json | null>(key, null)
    if (!data) return null

    return {
      id: `demo-${type}`,
      org_id: getOrgId(orgId),
      type,
      data: data,
      schema_version: 1,
      created_by: 'demo-user',
      created_at: now(),
    }
  }

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
  if (isDemoMode()) {
    const results: Assessment[] = []
    const types: AssessmentType[] = type
      ? [type]
      : ['flash_scan', 'full_audit', 'apex_audit']

    for (const t of types) {
      const key = getStorageKey(t)
      const data = safeGetItem<Json | null>(key, null)
      if (data) {
        results.push({
          id: `demo-${t}`,
          org_id: getOrgId(orgId),
          type: t,
          data: data,
          schema_version: 1,
          created_by: 'demo-user',
          created_at: now(),
        })
      }
    }
    return results
  }

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
  const id = generateId()
  const timestamp = now()

  if (isDemoMode()) {
    const key = getStorageKey(type)
    safeSetItem(key, data)
    return {
      id,
      org_id: getOrgId(orgId),
      type,
      data,
      schema_version: 1,
      created_by: userId || 'demo-user',
      created_at: timestamp,
    }
  }

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
