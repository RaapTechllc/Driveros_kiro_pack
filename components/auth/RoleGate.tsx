'use client'

import { type ReactNode } from 'react'
import { useOrg } from '@/components/providers/OrgProvider'
import type { MembershipRole } from '@/lib/supabase/types'

interface RoleGateProps {
  children: ReactNode
  /** Required roles to show children (OR logic - any role matches) */
  roles?: MembershipRole[]
  /** Show children only for owners */
  ownerOnly?: boolean
  /** Show children only for members (owner or member) */
  writeAccess?: boolean
  /** Fallback content when role check fails */
  fallback?: ReactNode
}

/**
 * Component that gates content based on user role.
 * Use to hide/show UI elements based on permissions.
 */
export function RoleGate({
  children,
  roles,
  ownerOnly,
  writeAccess,
  fallback = null,
}: RoleGateProps) {
  const { role, isOwner, canWrite } = useOrg()

  // Check owner-only access
  if (ownerOnly && !isOwner) {
    return <>{fallback}</>
  }

  // Check write access (owner or member)
  if (writeAccess && !canWrite) {
    return <>{fallback}</>
  }

  // Check specific roles
  if (roles && roles.length > 0) {
    if (!role || !roles.includes(role)) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

/**
 * Gate for owner-only content.
 */
export function OwnerGate({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <RoleGate ownerOnly fallback={fallback}>
      {children}
    </RoleGate>
  )
}

/**
 * Gate for content that requires write access.
 */
export function WriteGate({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <RoleGate writeAccess fallback={fallback}>
      {children}
    </RoleGate>
  )
}

/**
 * Gate for coach-only content.
 */
export function CoachGate({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <RoleGate roles={['coach']} fallback={fallback}>
      {children}
    </RoleGate>
  )
}
