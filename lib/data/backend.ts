/**
 * Abstract DataBackend interface.
 * All data access goes through this interface, toggled by NEXT_PUBLIC_DATA_BACKEND env var.
 */

import type {
  Action, Assessment, CheckIn, Meeting, NorthStar,
  InsertTables, UpdateTables, ActionStatus, ActionPriority,
  EngineName, AssessmentType, MeetingType,
} from '@/lib/supabase/types'

// Generic CRUD interface for org-scoped entities
export interface DataBackend {
  // Actions
  getActions(orgId: string): Promise<Action[]>
  getActionById(id: string, orgId: string): Promise<Action | null>
  createAction(action: Omit<InsertTables<'actions'>, 'id' | 'created_at' | 'updated_at'>, orgId: string): Promise<Action>
  updateAction(id: string, updates: UpdateTables<'actions'>): Promise<Action>
  deleteAction(id: string): Promise<void>
  getActionsByStatus(status: ActionStatus, orgId: string): Promise<Action[]>
  getActionsByEngine(engine: EngineName, orgId: string): Promise<Action[]>

  // Assessments
  getAssessments(orgId: string, type?: AssessmentType): Promise<Assessment[]>
  getLatestAssessment(orgId: string, type: AssessmentType): Promise<Assessment | null>
  createAssessment(assessment: Omit<InsertTables<'assessments'>, 'id' | 'created_at'>): Promise<Assessment>

  // Check-ins
  getCheckIns(orgId: string, limit?: number): Promise<CheckIn[]>
  getCheckInByDate(orgId: string, userId: string, date: string): Promise<CheckIn | null>
  createCheckIn(checkIn: Omit<InsertTables<'check_ins'>, 'id' | 'created_at'>): Promise<CheckIn>
  updateCheckIn(id: string, updates: Partial<CheckIn>): Promise<CheckIn>

  // Meetings
  getMeetings(orgId: string, type?: MeetingType): Promise<Meeting[]>
  createMeeting(meeting: Omit<InsertTables<'meetings'>, 'id' | 'created_at' | 'updated_at'>): Promise<Meeting>
  updateMeeting(id: string, updates: UpdateTables<'meetings'>): Promise<Meeting>

  // North Star
  getNorthStar(orgId: string): Promise<NorthStar | null>
  setNorthStar(orgId: string, goal: string, vehicle?: string, constraint?: string): Promise<NorthStar>

  // Company Memory (AI)
  getCompanyMemory(orgId: string): Promise<Record<string, unknown>>
  setCompanyMemory(orgId: string, memory: Record<string, unknown>): Promise<void>

  // Chat History
  getChatHistory(orgId: string, limit?: number): Promise<ChatMessage[]>
  addChatMessage(orgId: string, message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage>

  // Brand Config
  getBrandConfig(orgId: string): Promise<BrandConfig | null>
  setBrandConfig(orgId: string, config: Partial<BrandConfig>): Promise<BrandConfig>

  // Industry Config
  getIndustryConfig(orgId: string): Promise<IndustryConfig | null>
  setIndustryConfig(orgId: string, config: Partial<IndustryConfig>): Promise<IndustryConfig>

  // Scoring History
  getScoringHistory(orgId: string, engine?: EngineName, limit?: number): Promise<ScoreRecord[]>
  addScoreRecord(orgId: string, record: Omit<ScoreRecord, 'id' | 'recorded_at'>): Promise<ScoreRecord>
}

// Additional types not in the existing supabase types
export interface ChatMessage {
  id: string
  org_id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  page_context?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface BrandConfig {
  id: string
  org_id: string
  logo_url: string | null
  colors: { primary: string; secondary: string; accent: string }
  fonts: { heading: string; body: string }
  tone: string
  voice: string
  avoids: string[]
}

export interface IndustryConfig {
  id: string
  org_id: string
  plugin: string
  settings: Record<string, unknown>
  integrations: unknown[]
}

export interface ScoreRecord {
  id: string
  org_id: string
  engine: EngineName
  score: number
  gear?: number
  overall_score?: number
  source?: string
  recorded_at: string
}

/**
 * Get the active backend based on env var.
 * NEXT_PUBLIC_DATA_BACKEND=local|supabase (default: local)
 */
export function getBackendType(): 'local' | 'supabase' {
  const env = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_DATA_BACKEND
    : process.env.NEXT_PUBLIC_DATA_BACKEND
  if (env === 'supabase') return 'supabase'
  return 'local'
}

let _backend: DataBackend | null = null

export async function getBackend(): Promise<DataBackend> {
  if (_backend) return _backend

  const type = getBackendType()
  if (type === 'supabase') {
    const { SupabaseBackend } = await import('./supabase-backend')
    _backend = new SupabaseBackend()
  } else {
    const { LocalBackend } = await import('./local-backend')
    _backend = new LocalBackend()
  }
  return _backend
}

/** Reset cached backend (for testing) */
export function resetBackend(): void {
  _backend = null
}
