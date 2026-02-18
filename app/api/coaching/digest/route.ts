// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/coaching/digest
 *
 * Generates a personalized weekly coaching note for a DriverOS user.
 * Called by n8n on Monday 7AM CT as part of the Weekly Coaching Digest workflow.
 *
 * Authentication: x-api-key header must match COACHING_API_KEY env var
 *
 * Body: { userId: string, orgId?: string }
 *
 * Returns: {
 *   userId: string,
 *   northStar: string,
 *   coachingNote: string,
 *   weekNumber: number,
 *   generatedAt: string
 * }
 */

interface DigestRequest {
  userId: string
  orgId?: string
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function fetchUserData(supabase: ReturnType<typeof createClient>, userId: string, orgId?: string) {
  // Get membership/org if orgId not provided
  let resolvedOrgId = orgId
  if (!resolvedOrgId) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    resolvedOrgId = membership?.org_id
  }

  if (!resolvedOrgId) throw new Error(`No org found for user ${userId}`)

  // Get user profile (email for personalization)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', userId)
    .single()

  // Get active north star
  const { data: northStar } = await supabase
    .from('north_stars')
    .select('goal, vehicle, constraint')
    .eq('org_id', resolvedOrgId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get latest assessment for engine scores
  const { data: assessments } = await supabase
    .from('assessments')
    .select('data, created_at')
    .eq('org_id', resolvedOrgId)
    .order('created_at', { ascending: false })
    .limit(4)

  // Get this week's actions (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { data: actions } = await supabase
    .from('actions')
    .select('status, engine, priority')
    .eq('org_id', resolvedOrgId)

  // Get current streak
  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak, streak_type')
    .eq('user_id', userId)
    .eq('org_id', resolvedOrgId)
    .order('current_streak', { ascending: false })
    .limit(1)
    .single()

  return {
    profile,
    northStar,
    assessments: assessments || [],
    actions: actions || [],
    streak,
    orgId: resolvedOrgId,
  }
}

function extractEngineScores(assessments: any[]): {
  latest: Record<string, number>
  trend: string
  weeklyScores: string
} {
  if (!assessments.length) {
    return { latest: {}, trend: 'insufficient data', weeklyScores: 'No assessment data available' }
  }

  const engines = ['vision', 'people', 'operations', 'revenue', 'finance']

  // Parse scores from most recent assessment
  const latestAssessment = assessments[0]
  const latestData = latestAssessment?.data as any || {}

  // Try to extract engine scores from assessment data structure
  const latest: Record<string, number> = {}
  for (const engine of engines) {
    // Check various possible data structures
    const score = latestData?.scores?.[engine] ??
                  latestData?.[engine]?.score ??
                  latestData?.[engine] ??
                  null
    if (score !== null && !isNaN(Number(score))) {
      latest[engine] = Math.round(Number(score))
    }
  }

  // Build trend string comparing first and last assessment
  let trend = 'stable'
  let trendDetails = ''
  if (assessments.length >= 2) {
    const oldestData = assessments[assessments.length - 1]?.data as any || {}
    const improvements: string[] = []
    const declines: string[] = []

    for (const engine of engines) {
      const newScore = latest[engine]
      const oldScore = oldestData?.scores?.[engine] ?? oldestData?.[engine]?.score ?? null
      if (newScore !== undefined && oldScore !== null) {
        const diff = newScore - Number(oldScore)
        if (diff >= 5) improvements.push(`${engine} +${diff}`)
        else if (diff <= -5) declines.push(`${engine} ${diff}`)
      }
    }

    if (improvements.length > declines.length) trend = 'improving'
    else if (declines.length > improvements.length) trend = 'declining'

    const parts = [...improvements, ...declines]
    trendDetails = parts.length > 0 ? parts.join(', ') : 'stable across all engines'
  }

  // Format for prompt
  const scoreEntries = Object.entries(latest)
  const weeklyScores = scoreEntries.length > 0
    ? scoreEntries.map(([engine, score]) => `${engine}: ${score}/100`).join(', ')
    : 'Assessment scores pending'

  return { latest, trend: `${trend} (${trendDetails || 'trend data limited'})`, weeklyScores }
}

function computeActionStats(actions: any[]) {
  const total = actions.length
  const completed = actions.filter(a => a.status === 'completed').length
  const inProgress = actions.filter(a => a.status === 'in_progress').length
  const blocked = actions.filter(a => a.status === 'blocked').length
  return { total, completed, inProgress, blocked }
}

async function generateCoachingNote(params: {
  northStar: string
  engineScores: string
  trendDirection: string
  completed: number
  total: number
  streakDays: number
  apiKey: string
}): Promise<string> {
  const { northStar, engineScores, trendDirection, completed, total, streakDays, apiKey } = params

  const prompt = `You are a business coach using the Kiro methodology. Here's your entrepreneur's data this week:
- North Star: ${northStar}
- Engine scores this week: ${engineScores}
- Score trends (4 weeks): ${trendDirection}
- Actions completed: ${completed}/${total} this week
- Current streak: ${streakDays} days

Write a 3-paragraph weekly coaching note (under 200 words):
1. Celebrate one specific win from this week's data
2. Identify the most important bottleneck to address
3. Give ONE specific action to take next week (concrete, not generic)

Tone: warm but direct, like a trusted coach who knows their business.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20250929',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data?.content?.[0]?.text?.trim() || 'Unable to generate coaching note.'
}

export async function POST(request: NextRequest) {
  // Auth check
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.COACHING_API_KEY

  if (!expectedKey) {
    console.error('[CoachingDigest] COACHING_API_KEY not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 503 })
  }

  if (!apiKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Validate request body
  let body: DigestRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { userId, orgId } = body
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  try {
    // Create Supabase admin client
    const supabase = createAdminSupabase()

    // Fetch all user data
    const userData = await fetchUserData(supabase, userId, orgId)

    // Extract engine scores and trends
    const { weeklyScores, trend } = extractEngineScores(userData.assessments)

    // Compute action stats
    const actionStats = computeActionStats(userData.actions)

    // Get north star text
    const northStarText = userData.northStar?.goal || 'No active North Star set'

    // Get streak days
    const streakDays = userData.streak?.current_streak || 0

    // Generate coaching note via Claude Haiku
    const coachingNote = await generateCoachingNote({
      northStar: northStarText,
      engineScores: weeklyScores,
      trendDirection: trend,
      completed: actionStats.completed,
      total: actionStats.total,
      streakDays,
      apiKey: anthropicKey,
    })

    const now = new Date()

    return NextResponse.json({
      userId,
      northStar: northStarText,
      coachingNote,
      weekNumber: getWeekNumber(now),
      generatedAt: now.toISOString(),
      // Extra context for the email template
      userName: userData.profile?.name || 'there',
      actionStats,
      streakDays,
    })
  } catch (err) {
    console.error('[CoachingDigest] Error generating digest:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Health check
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.COACHING_API_KEY

  if (!expectedKey || !apiKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    status: 'ok',
    endpoint: 'POST /api/coaching/digest',
    description: 'DriverOS Weekly AI Coaching Digest',
    schedule: 'Monday 7AM CT (1PM UTC)',
  })
}
