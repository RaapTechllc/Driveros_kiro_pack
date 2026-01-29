// Client-side exports
export { createClient, getSupabaseClient } from './client'

// Server-side exports
export { createServerSupabaseClient, createAdminClient } from './server'

// Middleware exports
export {
  updateSession,
  protectedRoutes,
  publicRoutes,
  isProtectedRoute,
} from './middleware'

// Auth exports
export {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  getSession,
  getCurrentUser,
  createOrganization,
  inviteUser,
  acceptInvitation,
  hasRole,
  isOwner,
  isCoach,
  canWrite,
  canManageOrg,
  type AuthUser,
} from './auth'

// Type exports
export type {
  Database,
  Json,
  MembershipRole,
  EngineName,
  AssessmentType,
  MeetingType,
  ActionStatus,
  ActionPriority,
  Tables,
  InsertTables,
  UpdateTables,
  Org,
  Profile,
  Membership,
  NorthStar,
  Assessment,
  EngineScore,
  Accelerator,
  AcceleratorHistory,
  Action,
  Meeting,
  CheckIn,
  Streak,
  YearPlan,
  YearItem,
  ParkedIdea,
  Invitation,
} from './types'
