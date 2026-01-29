/**
 * Database types for Supabase.
 * These types mirror the database schema and are used for type-safe queries.
 *
 * In production, these would be auto-generated using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Role types for multi-tenant access control
export type MembershipRole = 'owner' | 'member' | 'coach'

// Engine types from DriverOS framework
export type EngineName = 'vision' | 'people' | 'operations' | 'revenue' | 'finance'

// Assessment types
export type AssessmentType = 'flash_scan' | 'full_audit' | 'apex_audit'

// Meeting types
export type MeetingType = 'warm_up' | 'pit_stop' | 'full_tune_up' | 'check_in'

// Action status
export type ActionStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'parked'

// Action priority
export type ActionPriority = 'do_now' | 'do_next'

export interface Database {
  public: {
    Tables: {
      // Organizations (tenants/workspaces)
      orgs: {
        Row: {
          id: string
          name: string
          slug: string
          industry: string | null
          size_band: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          industry?: string | null
          size_band?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          industry?: string | null
          size_band?: string | null
          updated_at?: string
        }
      }

      // User profiles (extends Supabase auth.users)
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          name?: string | null
          avatar_url?: string | null
          role?: string | null
          updated_at?: string
        }
      }

      // User ↔ Org relationship with roles
      memberships: {
        Row: {
          id: string
          user_id: string
          org_id: string
          role: MembershipRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          org_id: string
          role: MembershipRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          role?: MembershipRole
          updated_at?: string
        }
      }

      // North Star goal per org
      north_stars: {
        Row: {
          id: string
          org_id: string
          goal: string
          vehicle: string | null
          constraint: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          goal: string
          vehicle?: string | null
          constraint?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          goal?: string
          vehicle?: string | null
          constraint?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }

      // Assessments (flash scan, full audit, apex audit)
      assessments: {
        Row: {
          id: string
          org_id: string
          type: AssessmentType
          data: Json
          schema_version: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          type: AssessmentType
          data: Json
          schema_version?: number
          created_by: string
          created_at?: string
        }
        Update: {
          data?: Json
          schema_version?: number
        }
      }

      // Engine scores over time
      engine_scores: {
        Row: {
          id: string
          org_id: string
          assessment_id: string | null
          engine: EngineName
          score: number
          max_score: number
          recorded_at: string
        }
        Insert: {
          id?: string
          org_id: string
          assessment_id?: string | null
          engine: EngineName
          score: number
          max_score?: number
          recorded_at?: string
        }
        Update: {
          score?: number
          max_score?: number
        }
      }

      // Accelerators (KPIs/metrics)
      accelerators: {
        Row: {
          id: string
          org_id: string
          metric_name: string
          target_value: number | null
          current_value: number | null
          unit: string | null
          frequency: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          metric_name: string
          target_value?: number | null
          current_value?: number | null
          unit?: string | null
          frequency?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          metric_name?: string
          target_value?: number | null
          current_value?: number | null
          unit?: string | null
          frequency?: string | null
          updated_at?: string
        }
      }

      // Accelerator history for trend tracking
      accelerator_history: {
        Row: {
          id: string
          accelerator_id: string
          value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          accelerator_id: string
          value: number
          recorded_at?: string
        }
        Update: {
          value?: number
        }
      }

      // Actions (tasks/recommendations)
      actions: {
        Row: {
          id: string
          org_id: string
          title: string
          description: string | null
          why: string | null
          owner: string | null
          engine: EngineName | null
          priority: ActionPriority
          status: ActionStatus
          effort: number | null
          due_date: string | null
          north_star_id: string | null
          source: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          title: string
          description?: string | null
          why?: string | null
          owner?: string | null
          engine?: EngineName | null
          priority?: ActionPriority
          status?: ActionStatus
          effort?: number | null
          due_date?: string | null
          north_star_id?: string | null
          source?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          why?: string | null
          owner?: string | null
          engine?: EngineName | null
          priority?: ActionPriority
          status?: ActionStatus
          effort?: number | null
          due_date?: string | null
          north_star_id?: string | null
          updated_at?: string
        }
      }

      // Meetings
      meetings: {
        Row: {
          id: string
          org_id: string
          type: MeetingType
          scheduled_for: string | null
          completed_at: string | null
          notes: string | null
          decisions: Json | null
          action_ids: string[] | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          type: MeetingType
          scheduled_for?: string | null
          completed_at?: string | null
          notes?: string | null
          decisions?: Json | null
          action_ids?: string[] | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          scheduled_for?: string | null
          completed_at?: string | null
          notes?: string | null
          decisions?: Json | null
          action_ids?: string[] | null
          updated_at?: string
        }
      }

      // Check-ins (daily habit loop)
      check_ins: {
        Row: {
          id: string
          org_id: string
          user_id: string
          date: string
          actions_completed: boolean | null
          blocker: string | null
          win_or_lesson: string | null
          action_updates: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          date: string
          actions_completed?: boolean | null
          blocker?: string | null
          win_or_lesson?: string | null
          action_updates?: Json | null
          created_at?: string
        }
        Update: {
          actions_completed?: boolean | null
          blocker?: string | null
          win_or_lesson?: string | null
          action_updates?: Json | null
        }
      }

      // User streaks for habit tracking
      streaks: {
        Row: {
          id: string
          user_id: string
          org_id: string
          streak_type: string
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          org_id: string
          streak_type: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          updated_at?: string
        }
        Update: {
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          updated_at?: string
        }
      }

      // Year plans
      year_plans: {
        Row: {
          id: string
          org_id: string
          year: number
          north_star_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          year: number
          north_star_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          north_star_id?: string | null
          updated_at?: string
        }
      }

      // Year plan items
      year_items: {
        Row: {
          id: string
          year_plan_id: string
          type: string
          title: string
          department: string | null
          quarter: number
          status: string
          rationale: string | null
          alignment_status: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year_plan_id: string
          type: string
          title: string
          department?: string | null
          quarter: number
          status?: string
          rationale?: string | null
          alignment_status?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          type?: string
          title?: string
          department?: string | null
          quarter?: number
          status?: string
          rationale?: string | null
          alignment_status?: string | null
          updated_at?: string
        }
      }

      // Parked ideas (guardrail inbox)
      parked_ideas: {
        Row: {
          id: string
          org_id: string
          title: string
          description: string | null
          reason: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          title: string
          description?: string | null
          reason?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          reason?: string | null
        }
      }

      // Invitations for new team members
      invitations: {
        Row: {
          id: string
          org_id: string
          email: string
          role: MembershipRole
          invited_by: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          role: MembershipRole
          invited_by: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          accepted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      membership_role: MembershipRole
      engine_name: EngineName
      assessment_type: AssessmentType
      meeting_type: MeetingType
      action_status: ActionStatus
      action_priority: ActionPriority
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Org = Tables<'orgs'>
export type Profile = Tables<'profiles'>
export type Membership = Tables<'memberships'>
export type NorthStar = Tables<'north_stars'>
export type Assessment = Tables<'assessments'>
export type EngineScore = Tables<'engine_scores'>
export type Accelerator = Tables<'accelerators'>
export type AcceleratorHistory = Tables<'accelerator_history'>
export type Action = Tables<'actions'>
export type Meeting = Tables<'meetings'>
export type CheckIn = Tables<'check_ins'>
export type Streak = Tables<'streaks'>
export type YearPlan = Tables<'year_plans'>
export type YearItem = Tables<'year_items'>
export type ParkedIdea = Tables<'parked_ideas'>
export type Invitation = Tables<'invitations'>
