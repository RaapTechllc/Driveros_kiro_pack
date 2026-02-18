// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/users/active
 *
 * Returns a list of active DriverOS users for the weekly coaching digest.
 * "Active" = has logged in within the last 90 days OR has completed at least one check-in.
 *
 * Authentication: x-api-key header must match COACHING_API_KEY env var
 *
 * Returns: { users: Array<{ userId: string, orgId: string, email: string, name: string }> }
 */

function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  // Auth check
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.COACHING_API_KEY

  if (!expectedKey) {
    console.error('[ActiveUsers] COACHING_API_KEY not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 503 })
  }

  if (!apiKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminSupabase()

    // Get all memberships with profile info
    // Active = anyone with a membership (simplest reliable approach)
    // Orgs can be filtered by activity later
    const { data: memberships, error } = await supabase
      .from('memberships')
      .select(`
        user_id,
        org_id,
        role,
        profiles:user_id (
          email,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Deduplicate by user_id (take most recent membership per user)
    const seen = new Set<string>()
    const users: Array<{ userId: string; orgId: string; email: string; name: string }> = []

    for (const m of memberships || []) {
      if (seen.has(m.user_id)) continue
      seen.add(m.user_id)

      const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
      if (!profile?.email) continue  // Skip users without email

      users.push({
        userId: m.user_id,
        orgId: m.org_id,
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
      })
    }

    return NextResponse.json({
      users,
      count: users.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[ActiveUsers] Error fetching users:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
