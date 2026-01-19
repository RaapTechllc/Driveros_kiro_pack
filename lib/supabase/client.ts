import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Create a Supabase client for browser-side operations.
 * This client is safe to use in React components.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Singleton client for use in components.
 * Call this function to get the Supabase client instance.
 */
let browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}
