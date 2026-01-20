'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthProvider'
import { createClient } from '@/lib/supabase/client'
import type { Org, MembershipRole } from '@/lib/supabase/types'

interface OrgContextType {
  currentOrg: Org | null
  role: MembershipRole | null
  isOwner: boolean
  isMember: boolean
  isCoach: boolean
  canWrite: boolean
  canManage: boolean
  switchOrg: (orgId: string) => Promise<void>
  getUserOrgs: () => Promise<Org[]>
}

const OrgContext = createContext<OrgContextType | undefined>(undefined)

export function useOrg() {
  const context = useContext(OrgContext)
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider')
  }
  return context
}

interface OrgProviderProps {
  children: ReactNode
}

export function OrgProvider({ children }: OrgProviderProps) {
  const { user, isDemoMode, refreshUser } = useAuth()
  const [switchingOrg, setSwitchingOrg] = useState(false)

  const currentOrg = user?.currentOrg || null
  const role = user?.membership?.role || null

  const isOwner = role === 'owner'
  const isMember = role === 'member'
  const isCoach = role === 'coach'
  const canWrite = isOwner || isMember
  const canManage = isOwner

  const getUserOrgs = useCallback(async (): Promise<Org[]> => {
    if (isDemoMode || !user) return []

    const supabase = createClient()
    const { data, error } = await supabase
      .from('memberships')
      .select('orgs(*)')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching user orgs:', error)
      return []
    }

    return (data || [])
      .map((m) => (m as any).orgs as Org)
      .filter((org): org is Org => org !== null)
  }, [isDemoMode, user])

  const switchOrg = useCallback(
    async (orgId: string) => {
      if (isDemoMode || !user || switchingOrg) return

      setSwitchingOrg(true)
      try {
        // For now, just refresh user data
        // In future, we could store the "current org" preference
        await refreshUser()
      } finally {
        setSwitchingOrg(false)
      }
    },
    [isDemoMode, user, switchingOrg, refreshUser]
  )

  const value: OrgContextType = {
    currentOrg,
    role,
    isOwner,
    isMember,
    isCoach,
    canWrite,
    canManage,
    switchOrg,
    getUserOrgs,
  }

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>
}
