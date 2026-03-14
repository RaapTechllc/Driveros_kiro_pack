/**
 * LocalBackend — localStorage implementation of DataBackend.
 * Used in demo mode or when Supabase is not configured.
 */

import { safeGetItem, safeSetItem, STORAGE_KEYS } from '@/lib/storage'
import type {
  Action, Assessment, CheckIn, Meeting, NorthStar,
  InsertTables, UpdateTables, ActionStatus, EngineName,
  AssessmentType, MeetingType,
} from '@/lib/supabase/types'
import type {
  DataBackend, ChatMessage, BrandConfig, IndustryConfig, ScoreRecord,
} from './backend'

const KEYS = {
  ACTIONS: STORAGE_KEYS.IMPORTED_ACTIONS || 'driveros_actions',
  ASSESSMENTS: 'driveros_assessments',
  CHECKINS: 'driveros_checkins',
  MEETINGS: 'driveros_meetings',
  NORTH_STAR: 'driveros_north_star',
  MEMORY: 'driveros_company_memory',
  CHAT: 'driveros_chat_history',
  BRAND: 'driveros_brand_config',
  INDUSTRY: 'driveros_industry_config',
  SCORING: 'driveros_scoring_history',
}

function uid(): string { return crypto.randomUUID() }
function ts(): string { return new Date().toISOString() }

export class LocalBackend implements DataBackend {
  // ── Actions ─────────────────────────────────────────────────────
  async getActions(orgId: string): Promise<Action[]> {
    const raw = safeGetItem<any[]>(KEYS.ACTIONS, [])
    return raw.map(a => this.toAction(a, orgId))
  }

  async getActionById(id: string, orgId: string): Promise<Action | null> {
    const all = await this.getActions(orgId)
    return all.find(a => a.id === id) ?? null
  }

  async createAction(action: any, orgId: string): Promise<Action> {
    const raw = safeGetItem<any[]>(KEYS.ACTIONS, [])
    const newAction = {
      id: uid(), ...action,
      org_id: orgId, created_at: ts(), updated_at: ts(),
      status: action.status || 'not_started',
      priority: action.priority || 'do_next',
    }
    raw.unshift(newAction)
    safeSetItem(KEYS.ACTIONS, raw)
    return this.toAction(newAction, orgId)
  }

  async updateAction(id: string, updates: UpdateTables<'actions'>): Promise<Action> {
    const raw = safeGetItem<any[]>(KEYS.ACTIONS, [])
    const idx = raw.findIndex(a => a.id === id)
    if (idx === -1) throw new Error('Action not found')
    raw[idx] = { ...raw[idx], ...updates, updated_at: ts() }
    safeSetItem(KEYS.ACTIONS, raw)
    return this.toAction(raw[idx], raw[idx].org_id || 'demo')
  }

  async deleteAction(id: string): Promise<void> {
    const raw = safeGetItem<any[]>(KEYS.ACTIONS, [])
    safeSetItem(KEYS.ACTIONS, raw.filter(a => a.id !== id))
  }

  async getActionsByStatus(status: ActionStatus, orgId: string): Promise<Action[]> {
    return (await this.getActions(orgId)).filter(a => a.status === status)
  }

  async getActionsByEngine(engine: EngineName, orgId: string): Promise<Action[]> {
    return (await this.getActions(orgId)).filter(a => a.engine === engine)
  }

  // ── Assessments ─────────────────────────────────────────────────
  async getAssessments(orgId: string, type?: AssessmentType): Promise<Assessment[]> {
    const raw = safeGetItem<any[]>(KEYS.ASSESSMENTS, [])
    const filtered = type ? raw.filter(a => a.type === type) : raw
    return filtered.map(a => ({ ...a, org_id: orgId, created_by: a.created_by || 'demo-user' }))
  }

  async getLatestAssessment(orgId: string, type: AssessmentType): Promise<Assessment | null> {
    const all = await this.getAssessments(orgId, type)
    return all.length > 0 ? all[0] : null
  }

  async createAssessment(assessment: any): Promise<Assessment> {
    const raw = safeGetItem<any[]>(KEYS.ASSESSMENTS, [])
    const newA = { id: uid(), ...assessment, created_at: ts(), schema_version: assessment.schema_version || 1 }
    raw.unshift(newA)
    safeSetItem(KEYS.ASSESSMENTS, raw)
    return newA
  }

  // ── Check-ins ───────────────────────────────────────────────────
  async getCheckIns(orgId: string, limit?: number): Promise<CheckIn[]> {
    const raw = safeGetItem<any[]>(KEYS.CHECKINS, [])
    const mapped = raw.map(c => ({ ...c, org_id: orgId }))
    return limit ? mapped.slice(0, limit) : mapped
  }

  async getCheckInByDate(orgId: string, userId: string, date: string): Promise<CheckIn | null> {
    const all = await this.getCheckIns(orgId)
    return all.find(c => c.date === date && c.user_id === userId) ?? null
  }

  async createCheckIn(checkIn: any): Promise<CheckIn> {
    const raw = safeGetItem<any[]>(KEYS.CHECKINS, [])
    const newC = { id: uid(), ...checkIn, created_at: ts() }
    raw.unshift(newC)
    safeSetItem(KEYS.CHECKINS, raw)
    return newC
  }

  async updateCheckIn(id: string, updates: Partial<CheckIn>): Promise<CheckIn> {
    const raw = safeGetItem<any[]>(KEYS.CHECKINS, [])
    const idx = raw.findIndex(c => c.id === id)
    if (idx === -1) throw new Error('CheckIn not found')
    raw[idx] = { ...raw[idx], ...updates }
    safeSetItem(KEYS.CHECKINS, raw)
    return raw[idx]
  }

  // ── Meetings ────────────────────────────────────────────────────
  async getMeetings(orgId: string, type?: MeetingType): Promise<Meeting[]> {
    const raw = safeGetItem<any[]>(KEYS.MEETINGS, [])
    const filtered = type ? raw.filter(m => m.type === type) : raw
    return filtered.map(m => ({ ...m, org_id: orgId, created_by: m.created_by || 'demo-user' }))
  }

  async createMeeting(meeting: any): Promise<Meeting> {
    const raw = safeGetItem<any[]>(KEYS.MEETINGS, [])
    const newM = { id: uid(), ...meeting, created_at: ts(), updated_at: ts() }
    raw.unshift(newM)
    safeSetItem(KEYS.MEETINGS, raw)
    return newM
  }

  async updateMeeting(id: string, updates: UpdateTables<'meetings'>): Promise<Meeting> {
    const raw = safeGetItem<any[]>(KEYS.MEETINGS, [])
    const idx = raw.findIndex(m => m.id === id)
    if (idx === -1) throw new Error('Meeting not found')
    raw[idx] = { ...raw[idx], ...updates, updated_at: ts() }
    safeSetItem(KEYS.MEETINGS, raw)
    return raw[idx]
  }

  // ── North Star ──────────────────────────────────────────────────
  async getNorthStar(orgId: string): Promise<NorthStar | null> {
    return safeGetItem<NorthStar | null>(KEYS.NORTH_STAR, null)
  }

  async setNorthStar(orgId: string, goal: string, vehicle?: string, constraint?: string): Promise<NorthStar> {
    const existing = await this.getNorthStar(orgId)
    const ns: NorthStar = {
      id: existing?.id || uid(),
      org_id: orgId, goal,
      vehicle: vehicle ?? null,
      constraint: constraint ?? null,
      is_active: true,
      created_at: existing?.created_at || ts(),
      updated_at: ts(),
    }
    safeSetItem(KEYS.NORTH_STAR, ns)
    return ns
  }

  // ── Company Memory ──────────────────────────────────────────────
  async getCompanyMemory(orgId: string): Promise<Record<string, unknown>> {
    return safeGetItem<Record<string, unknown>>(KEYS.MEMORY, {})
  }

  async setCompanyMemory(orgId: string, memory: Record<string, unknown>): Promise<void> {
    safeSetItem(KEYS.MEMORY, memory)
  }

  // ── Chat History ────────────────────────────────────────────────
  async getChatHistory(orgId: string, limit?: number): Promise<ChatMessage[]> {
    const raw = safeGetItem<ChatMessage[]>(KEYS.CHAT, [])
    return limit ? raw.slice(-limit) : raw
  }

  async addChatMessage(orgId: string, message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> {
    const raw = safeGetItem<ChatMessage[]>(KEYS.CHAT, [])
    const msg: ChatMessage = { id: uid(), ...message, created_at: ts() }
    raw.push(msg)
    // Keep last 500 messages
    if (raw.length > 500) raw.splice(0, raw.length - 500)
    safeSetItem(KEYS.CHAT, raw)
    return msg
  }

  // ── Brand Config ────────────────────────────────────────────────
  async getBrandConfig(orgId: string): Promise<BrandConfig | null> {
    return safeGetItem<BrandConfig | null>(KEYS.BRAND, null)
  }

  async setBrandConfig(orgId: string, config: Partial<BrandConfig>): Promise<BrandConfig> {
    const existing = await this.getBrandConfig(orgId)
    const bc: BrandConfig = {
      id: existing?.id || uid(),
      org_id: orgId,
      logo_url: config.logo_url ?? existing?.logo_url ?? null,
      colors: config.colors ?? existing?.colors ?? { primary: '#2563eb', secondary: '#1e40af', accent: '#f59e0b' },
      fonts: config.fonts ?? existing?.fonts ?? { heading: 'Inter', body: 'Inter' },
      tone: config.tone ?? existing?.tone ?? 'professional',
      voice: config.voice ?? existing?.voice ?? 'confident and clear',
      avoids: config.avoids ?? existing?.avoids ?? [],
    }
    safeSetItem(KEYS.BRAND, bc)
    return bc
  }

  // ── Industry Config ─────────────────────────────────────────────
  async getIndustryConfig(orgId: string): Promise<IndustryConfig | null> {
    return safeGetItem<IndustryConfig | null>(KEYS.INDUSTRY, null)
  }

  async setIndustryConfig(orgId: string, config: Partial<IndustryConfig>): Promise<IndustryConfig> {
    const existing = await this.getIndustryConfig(orgId)
    const ic: IndustryConfig = {
      id: existing?.id || uid(),
      org_id: orgId,
      plugin: config.plugin ?? existing?.plugin ?? 'general',
      settings: config.settings ?? existing?.settings ?? {},
      integrations: config.integrations ?? existing?.integrations ?? [],
    }
    safeSetItem(KEYS.INDUSTRY, ic)
    return ic
  }

  // ── Scoring History ─────────────────────────────────────────────
  async getScoringHistory(orgId: string, engine?: EngineName, limit?: number): Promise<ScoreRecord[]> {
    const raw = safeGetItem<ScoreRecord[]>(KEYS.SCORING, [])
    let filtered = engine ? raw.filter(s => s.engine === engine) : raw
    return limit ? filtered.slice(0, limit) : filtered
  }

  async addScoreRecord(orgId: string, record: Omit<ScoreRecord, 'id' | 'recorded_at'>): Promise<ScoreRecord> {
    const raw = safeGetItem<ScoreRecord[]>(KEYS.SCORING, [])
    const sr: ScoreRecord = { id: uid(), ...record, recorded_at: ts() }
    raw.unshift(sr)
    safeSetItem(KEYS.SCORING, raw)
    return sr
  }

  // ── Helpers ─────────────────────────────────────────────────────
  private toAction(a: any, orgId: string): Action {
    return {
      id: a.id,
      org_id: orgId,
      title: a.title,
      description: a.description ?? null,
      why: a.why ?? null,
      owner: a.owner ?? null,
      engine: a.engine ?? null,
      priority: a.priority || 'do_next',
      status: a.status || 'not_started',
      effort: a.effort ?? null,
      due_date: a.due_date ?? null,
      north_star_id: a.north_star_id ?? null,
      source: a.source ?? null,
      created_by: a.created_by || 'demo-user',
      created_at: a.created_at || ts(),
      updated_at: a.updated_at || ts(),
    }
  }
}
