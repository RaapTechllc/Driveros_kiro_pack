// @ts-nocheck
// TODO: Regenerate Supabase types from local schema to fix type errors
import { createClient } from './client'
import type { Membership, MembershipRole, Org, Profile } from './types'

export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
  currentOrg: Org | null
  membership: Membership | null
}

/**
 * Sign up a new user with email and password.
 */
export async function signUp(email: string, password: string, name?: string) {
  const supabase = createClient()

  // Get the base URL for redirect after email confirmation
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4005'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      // Redirect to auth callback after email confirmation
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

/**
 * Sign in with email and password.
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Send password reset email.
 */
export async function resetPassword(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
}

/**
 * Update password (when user has reset token).
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}

/**
 * Get the current session.
 */
export async function getSession() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

/**
 * Get the current user with their profile and org membership.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get current org membership (first org for now)
  const { data: membership } = await supabase
    .from('memberships')
    .select('*, orgs(*)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const currentOrg = membership?.orgs as unknown as Org | null

  return {
    id: user.id,
    email: user.email || '',
    profile: profile || null,
    currentOrg: currentOrg || null,
    membership: membership ? {
      id: membership.id,
      user_id: membership.user_id,
      org_id: membership.org_id,
      role: membership.role as MembershipRole,
      created_at: membership.created_at,
      updated_at: membership.updated_at,
    } : null,
  }
}

/**
 * Create a new organization and add the current user as owner.
 */
export async function createOrganization(name: string, slug: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Create org
  const { data: org, error: orgError } = await supabase
    .from('orgs')
    .insert({
      name,
      slug,
    })
    .select()
    .single()

  if (orgError) throw orgError

  // Add user as owner
  const { error: memberError } = await supabase
    .from('memberships')
    .insert({
      user_id: user.id,
      org_id: org.id,
      role: 'owner',
    })

  if (memberError) throw memberError

  return org
}

/**
 * Invite a user to the current organization.
 */
export async function inviteUser(orgId: string, email: string, role: MembershipRole = 'member') {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Create invitation
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 day expiry

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      org_id: orgId,
      email,
      role,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Accept an invitation and join the organization.
 */
export async function acceptInvitation(invitationId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get invitation
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', invitationId)
    .is('accepted_at', null)
    .single()

  if (invError) throw new Error('Invitation not found')
  if (!invitation) throw new Error('Invitation not found')

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation has expired')
  }

  // Check email matches
  if (invitation.email !== user.email) {
    throw new Error('Invitation is for a different email address')
  }

  // Create membership
  const { error: memberError } = await supabase
    .from('memberships')
    .insert({
      user_id: user.id,
      org_id: invitation.org_id,
      role: invitation.role,
    })

  if (memberError) throw memberError

  // Mark invitation as accepted
  const { error: updateError } = await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitationId)

  if (updateError) throw updateError
}

/**
 * Check if user has a specific role in the org.
 */
export function hasRole(membership: Membership | null, ...roles: MembershipRole[]): boolean {
  if (!membership) return false
  return roles.includes(membership.role)
}

/**
 * Check if user is an owner.
 */
export function isOwner(membership: Membership | null): boolean {
  return hasRole(membership, 'owner')
}

/**
 * Check if user is a coach.
 */
export function isCoach(membership: Membership | null): boolean {
  return hasRole(membership, 'coach')
}

/**
 * Check if user can write data (owner or member).
 */
export function canWrite(membership: Membership | null): boolean {
  return hasRole(membership, 'owner', 'member')
}

/**
 * Check if user can manage the org (owner only).
 */
export function canManageOrg(membership: Membership | null): boolean {
  return hasRole(membership, 'owner')
}
