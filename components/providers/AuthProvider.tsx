'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuthUser } from '@/lib/supabase/auth'
import type { Membership, MembershipRole, Org, Profile } from '@/lib/supabase/types'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  isDemoMode: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if demo mode is enabled
  const isDemoMode =
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL

  const supabase = isDemoMode ? null : createClient()

  const fetchUserData = useCallback(
    async (supabaseUser: SupabaseUser): Promise<AuthUser> => {
      if (!supabase) {
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          profile: null,
          currentOrg: null,
          membership: null,
        }
      }

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      // Get current org membership
      const { data: membership } = await supabase
        .from('memberships')
        .select('*, orgs(*)')
        .eq('user_id', supabaseUser.id)
        .limit(1)
        .single()

      const currentOrg = (membership as any)?.orgs as Org | null

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        profile: profile || null,
        currentOrg: currentOrg || null,
        membership: membership
          ? {
              id: (membership as any).id,
              user_id: (membership as any).user_id,
              org_id: (membership as any).org_id,
              role: (membership as any).role as MembershipRole,
              created_at: (membership as any).created_at,
              updated_at: (membership as any).updated_at,
            }
          : null,
      }
    },
    [supabase]
  )

  const refreshUser = useCallback(async () => {
    if (!supabase) return

    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser()

    if (supabaseUser) {
      const userData = await fetchUserData(supabaseUser)
      setUser(userData)
    } else {
      setUser(null)
    }
  }, [supabase, fetchUserData])

  useEffect(() => {
    // Demo mode - no auth needed
    if (isDemoMode) {
      const timestamp = new Date().toISOString()
      setUser({
        id: 'demo-user',
        email: 'demo@driveros.ai',
        profile: null,
        currentOrg: {
          id: 'demo-org',
          name: 'Demo Org',
          slug: 'demo-org',
          industry: null,
          size_band: null,
          created_at: timestamp,
          updated_at: timestamp,
        },
        membership: {
          id: 'demo-membership',
          user_id: 'demo-user',
          org_id: 'demo-org',
          role: 'owner',
          created_at: timestamp,
          updated_at: timestamp,
        },
      })
      setIsLoading(false)
      return
    }

    if (!supabase) {
      setIsLoading(false)
      return
    }

    // Get initial session
    const initAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        setSession(initialSession)

        if (initialSession?.user) {
          const userData = await fetchUserData(initialSession.user)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)

      if (event === 'SIGNED_IN' && newSession?.user) {
        const userData = await fetchUserData(newSession.user)
        setUser(userData)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
        const userData = await fetchUserData(newSession.user)
        setUser(userData)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, isDemoMode, fetchUserData])

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Auth not available in demo mode')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signUp = async (email: string, password: string, name?: string) => {
    if (!supabase) throw new Error('Auth not available in demo mode')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) throw error
  }

  const signOut = async () => {
    if (!supabase) return

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    isDemoMode,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
