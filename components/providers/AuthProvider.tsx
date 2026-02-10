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

  // Check if Supabase is configured
  const supabase = createClient()

  const fetchUserData = useCallback(
    async (supabaseUser: SupabaseUser): Promise<AuthUser> => {

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
  }, [supabase, fetchUserData])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signUp = async (email: string, password: string, name?: string) => {
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
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
