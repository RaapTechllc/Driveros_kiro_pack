/**
 * SupabaseBackend — Supabase implementation of DataBackend.
 * Used in production mode with real Supabase project.
 */

import { createClient } from '@/lib/supabase/client'
import type {
  Action, Assessment, CheckIn, Meeting, NorthStar,
  InsertTables, UpdateTables, ActionStatus, EngineName,
  AssessmentType, MeetingType,
} from '@/lib/supabase/types'
import type {
  DataBackend, ChatMessage, BrandConfig, IndustryConfig, ScoreRecord,
} from './backend'

export class SupabaseBackend implements DataBackend {
  private get db() { return createClient() }

  // ── Actions ─────────────────────────────────────────────────────
  async getActions(orgId: string): Promise<Action[]> {
    const { data, error } = await this.db
      .from('actions').select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }

  async getActionById(id: string, orgId: string): Promise<Action | null> {
    const { data, error } = await this.db
      .from('actions').select('*').eq('id', id).single()
    if (error) return null
    return data
  }

  async createAction(action: any, orgId: string): Promise<Action> {
    const { data, error } = await this.db
      .from('actions').insert({ ...action, org_id: orgId }).select().single()
    if (error) throw error
    return data!
  }

  async updateAction(id: string, updates: UpdateTables<'actions'>): Promise<Action> {
    const { data, error } = await this.db
      .from('actions').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data!
  }

  async deleteAction(id: string): Promise<void> {
    const { error } = await this.db.from('actions').delete().eq('id', id)
    if (error) throw error
  }

  async getActionsByStatus(status: ActionStatus, orgId: string): Promise<Action[]> {
    const { data, error } = await this.db
      .from('actions').select('*').eq('org_id', orgId).eq('status', status)
    if (error) throw error
    return data ?? []
  }

  async getActionsByEngine(engine: EngineName, orgId: string): Promise<Action[]> {
    const { data, error } = await this.db
      .from('actions').select('*').eq('org_id', orgId).eq('engine', engine)
    if (error) throw error
    return data ?? []
  }

  // ── Assessments ─────────────────────────────────────────────────
  async getAssessments(orgId: string, type?: AssessmentType): Promise<Assessment[]> {
    let q = this.db.from('assessments').select('*').eq('org_id', orgId).order('created_at', { ascending: false })
    if (type) q = q.eq('type', type)
    const { data, error } = await q
    if (error) throw error
    return data ?? []
  }

  async getLatestAssessment(orgId: string, type: AssessmentType): Promise<Assessment | null> {
    const { data, error } = await this.db
      .from('assessments').select('*')
      .eq('org_id', orgId).eq('type', type)
      .order('created_at', { ascending: false }).limit(1).single()
    if (error) return null
    return data
  }

  async createAssessment(assessment: any): Promise<Assessment> {
    const { data, error } = await this.db
      .from('assessments').insert(assessment).select().single()
    if (error) throw error
    return data!
  }

  // ── Check-ins ───────────────────────────────────────────────────
  async getCheckIns(orgId: string, limit?: number): Promise<CheckIn[]> {
    let q = this.db.from('check_ins').select('*').eq('org_id', orgId).order('date', { ascending: false })
    if (limit) q = q.limit(limit)
    const { data, error } = await q
    if (error) throw error
    return data ?? []
  }

  async getCheckInByDate(orgId: string, userId: string, date: string): Promise<CheckIn | null> {
    const { data, error } = await this.db
      .from('check_ins').select('*')
      .eq('org_id', orgId).eq('user_id', userId).eq('date', date).single()
    if (error) return null
    return data
  }

  async createCheckIn(checkIn: any): Promise<CheckIn> {
    const { data, error } = await this.db
      .from('check_ins').insert(checkIn).select().single()
    if (error) throw error
    return data!
  }

  async updateCheckIn(id: string, updates: Partial<CheckIn>): Promise<CheckIn> {
    const { data, error } = await this.db
      .from('check_ins').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data!
  }

  // ── Meetings ────────────────────────────────────────────────────
  async getMeetings(orgId: string, type?: MeetingType): Promise<Meeting[]> {
    let q = this.db.from('meetings').select('*').eq('org_id', orgId).order('created_at', { ascending: false })
    if (type) q = q.eq('type', type)
    const { data, error } = await q
    if (error) throw error
    return data ?? []
  }

  async createMeeting(meeting: any): Promise<Meeting> {
    const { data, error } = await this.db
      .from('meetings').insert(meeting).select().single()
    if (error) throw error
    return data!
  }

  async updateMeeting(id: string, updates: UpdateTables<'meetings'>): Promise<Meeting> {
    const { data, error } = await this.db
      .from('meetings').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data!
  }

  // ── North Star ──────────────────────────────────────────────────
  async getNorthStar(orgId: string): Promise<NorthStar | null> {
    const { data, error } = await this.db
      .from('north_stars').select('*')
      .eq('org_id', orgId).eq('is_active', true)
      .order('created_at', { ascending: false }).limit(1).single()
    if (error) return null
    return data
  }

  async setNorthStar(orgId: string, goal: string, vehicle?: string, constraint?: string): Promise<NorthStar> {
    // Deactivate existing
    await this.db.from('north_stars').update({ is_active: false }).eq('org_id', orgId).eq('is_active', true)
    // Insert new
    const { data, error } = await this.db
      .from('north_stars').insert({
        org_id: orgId, goal,
        vehicle: vehicle ?? null,
        constraint: constraint ?? null,
        is_active: true,
      }).select().single()
    if (error) throw error
    return data!
  }

  // ── Company Memory ──────────────────────────────────────────────
  async getCompanyMemory(orgId: string): Promise<Record<string, unknown>> {
    const { data, error } = await this.db
      .from('company_memory').select('memory').eq('org_id', orgId).single()
    if (error || !data) return {}
    return (data.memory as Record<string, unknown>) ?? {}
  }

  async setCompanyMemory(orgId: string, memory: Record<string, unknown>): Promise<void> {
    const { error } = await this.db
      .from('company_memory').upsert({ org_id: orgId, memory }, { onConflict: 'org_id' })
    if (error) throw error
  }

  // ── Chat History ────────────────────────────────────────────────
  async getChatHistory(orgId: string, limit?: number): Promise<ChatMessage[]> {
    let q = this.db.from('chat_history').select('*').eq('org_id', orgId).order('created_at', { ascending: true })
    if (limit) q = q.limit(limit)
    const { data, error } = await q
    if (error) throw error
    return (data ?? []) as ChatMessage[]
  }

  async addChatMessage(orgId: string, message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> {
    const { data, error } = await this.db
      .from('chat_history').insert({ ...message, org_id: orgId }).select().single()
    if (error) throw error
    return data as ChatMessage
  }

  // ── Brand Config ────────────────────────────────────────────────
  async getBrandConfig(orgId: string): Promise<BrandConfig | null> {
    const { data, error } = await this.db
      .from('brand_config').select('*').eq('org_id', orgId).single()
    if (error) return null
    return data as BrandConfig
  }

  async setBrandConfig(orgId: string, config: Partial<BrandConfig>): Promise<BrandConfig> {
    const { data, error } = await this.db
      .from('brand_config').upsert({ ...config, org_id: orgId }, { onConflict: 'org_id' }).select().single()
    if (error) throw error
    return data as BrandConfig
  }

  // ── Industry Config ─────────────────────────────────────────────
  async getIndustryConfig(orgId: string): Promise<IndustryConfig | null> {
    const { data, error } = await this.db
      .from('industry_config').select('*').eq('org_id', orgId).single()
    if (error) return null
    return data as IndustryConfig
  }

  async setIndustryConfig(orgId: string, config: Partial<IndustryConfig>): Promise<IndustryConfig> {
    const { data, error } = await this.db
      .from('industry_config').upsert({ ...config, org_id: orgId }, { onConflict: 'org_id' }).select().single()
    if (error) throw error
    return data as IndustryConfig
  }

  // ── Scoring History ─────────────────────────────────────────────
  async getScoringHistory(orgId: string, engine?: EngineName, limit?: number): Promise<ScoreRecord[]> {
    let q = this.db.from('scoring_history').select('*').eq('org_id', orgId).order('recorded_at', { ascending: false })
    if (engine) q = q.eq('engine', engine)
    if (limit) q = q.limit(limit)
    const { data, error } = await q
    if (error) throw error
    return (data ?? []) as ScoreRecord[]
  }

  async addScoreRecord(orgId: string, record: Omit<ScoreRecord, 'id' | 'recorded_at'>): Promise<ScoreRecord> {
    const { data, error } = await this.db
      .from('scoring_history').insert({ ...record, org_id: orgId }).select().single()
    if (error) throw error
    return data as ScoreRecord
  }
}
