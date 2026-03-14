// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import type { CompanyMemory } from '@/lib/ai/types'

/**
 * POST /api/coaching/morning-briefing
 *
 * Generates a daily morning briefing — 60-second read.
 * Can be called client-side (demo mode, memory in body) or
 * server-side (production, fetches from Supabase).
 *
 * Body: { memory: CompanyMemory }
 *
 * Returns: {
 *   briefing: {
 *     headline: string,
 *     topActions: { title: string, engine: string, why: string }[],
 *     metrics: { engine: string, score: number, trend: string }[],
 *     streakStatus: { days: number, message: string },
 *     deadlines: string[],
 *     coachNote: string,
 *   },
 *   generatedAt: string
 * }
 */

interface MorningBriefing {
  headline: string
  topActions: { title: string; engine: string; why: string }[]
  metrics: { engine: string; score: number; trend: string }[]
  streakStatus: { days: number; message: string }
  deadlines: string[]
  coachNote: string
}

function generateBriefingFromMemory(memory: CompanyMemory): MorningBriefing {
  const now = new Date()
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  // === HEADLINE ===
  let headline: string
  const gear = memory.profile.currentGear
  const streak = memory.checkInInsights.currentStreak
  const downEngines = Object.entries(memory.engineSnapshot.trends)
    .filter(([, t]) => t === 'down')
    .map(([e]) => e)
  const upEngines = Object.entries(memory.engineSnapshot.trends)
    .filter(([, t]) => t === 'up')
    .map(([e]) => e)

  if (downEngines.length >= 2) {
    headline = `⚠️ ${dayOfWeek}, ${dateStr} — ${downEngines.length} engines need attention`
  } else if (upEngines.length >= 3) {
    headline = `🚀 ${dayOfWeek}, ${dateStr} — Momentum is building`
  } else if (streak >= 7) {
    headline = `🔥 ${dayOfWeek}, ${dateStr} — ${streak}-day streak, keep pushing`
  } else {
    headline = `📊 ${dayOfWeek}, ${dateStr} — Here's what matters today`
  }

  // === TOP 3 ACTIONS ===
  const topActions: MorningBriefing['topActions'] = []

  // Action 1: Address declining engine
  if (downEngines.length > 0) {
    const engine = downEngines[0]
    const score = memory.engineSnapshot.scores[engine as keyof typeof memory.engineSnapshot.scores]
    topActions.push({
      title: `Investigate ${engine} engine decline`,
      engine,
      why: score !== undefined ? `Score: ${score}/100 and dropping` : 'Trending down',
    })
  }

  // Action 2: Recurring blocker
  if (memory.checkInInsights.recurringBlockers.length > 0) {
    const blocker = memory.checkInInsights.recurringBlockers[memory.checkInInsights.recurringBlockers.length - 1]
    topActions.push({
      title: `Resolve recurring blocker`,
      engine: 'operations',
      why: `"${blocker}" keeps showing up in check-ins`,
    })
  }

  // Action 3: Strengthen weak engine or celebrate strong one
  if (memory.actionInsights.weakEngines.length > 0 && topActions.length < 3) {
    const weak = memory.actionInsights.weakEngines[0]
    topActions.push({
      title: `Commit to one ${weak} action today`,
      engine: weak,
      why: `You tend to abandon ${weak} tasks — small wins build momentum`,
    })
  }

  // Fill remaining with general good advice
  if (topActions.length < 3 && streak === 0) {
    topActions.push({
      title: 'Complete your daily check-in',
      engine: 'operations',
      why: '60 seconds to track momentum — start the streak',
    })
  }

  if (topActions.length < 3 && memory.engineSnapshot.assessmentCount > 0) {
    const timeline = memory.timeline
    const lastMeeting = timeline.filter(t => t.type === 'meeting').pop()
    if (!lastMeeting || daysSince(lastMeeting.date) > 7) {
      topActions.push({
        title: 'Schedule or run a Pit Stop',
        engine: 'operations',
        why: lastMeeting ? `Last meeting was ${daysSince(lastMeeting.date)} days ago` : 'No meetings logged yet',
      })
    }
  }

  if (topActions.length < 3 && memory.profile.northStar) {
    topActions.push({
      title: `Move toward your North Star`,
      engine: 'vision',
      why: `"${memory.profile.northStar}" — what's one thing you can do today?`,
    })
  }

  // === METRICS ===
  const metrics: MorningBriefing['metrics'] = Object.entries(memory.engineSnapshot.scores)
    .filter(([, score]) => score !== undefined)
    .map(([engine, score]) => {
      const trend = memory.engineSnapshot.trends[engine as keyof typeof memory.engineSnapshot.trends]
      return {
        engine,
        score: score as number,
        trend: trend === 'up' ? '↑ improving' : trend === 'down' ? '↓ declining' : trend === 'stable' ? '→ stable' : '● new',
      }
    })
    .sort((a, b) => a.score - b.score) // Worst first

  // === STREAK STATUS ===
  let streakMessage: string
  if (streak === 0) {
    streakMessage = 'No active streak — today is day 1'
  } else if (streak < 3) {
    streakMessage = `${streak}-day streak — building the habit`
  } else if (streak < 7) {
    streakMessage = `${streak}-day streak — almost a full week!`
  } else if (streak < 30) {
    streakMessage = `${streak}-day streak — this is discipline`
  } else {
    streakMessage = `${streak}-day streak — you're a machine`
  }

  const streakStatus = { days: streak, message: streakMessage }

  // === DEADLINES ===
  const deadlines: string[] = []
  const recentTimeline = memory.timeline.slice(-10)
  for (const entry of recentTimeline) {
    if (entry.type === 'north_star_change') {
      deadlines.push(`North Star: ${entry.summary}`)
    }
  }

  // Stale assessment warning
  if (memory.engineSnapshot.lastAssessmentDate) {
    const days = daysSince(memory.engineSnapshot.lastAssessmentDate)
    if (days > 21) {
      deadlines.push(`Assessment is ${days} days old — consider a refresh`)
    }
  }

  // === COACH NOTE ===
  let coachNote: string
  const completionRate = memory.actionInsights.totalCompleted + memory.actionInsights.totalAbandoned > 0
    ? Math.round((memory.actionInsights.totalCompleted / (memory.actionInsights.totalCompleted + memory.actionInsights.totalAbandoned)) * 100)
    : null

  if (memory.coachNotes.length > 0) {
    coachNote = memory.coachNotes[memory.coachNotes.length - 1]
  } else if (completionRate !== null && completionRate < 50) {
    coachNote = `Action completion rate is ${completionRate}%. Either reduce scope or increase commitment — both are valid. The worst outcome is a full list of abandoned tasks.`
  } else if (downEngines.length > 0 && upEngines.length > 0) {
    coachNote = `Mixed signals: ${upEngines.join(', ')} improving while ${downEngines.join(', ')} declining. Focus compounds — pick the one engine that unlocks the others.`
  } else if (gear && gear <= 2 && memory.engineSnapshot.assessmentCount > 0) {
    coachNote = 'At Gear 1-2, the founder IS the business. Your #1 job: build one system this week that runs without you.'
  } else {
    coachNote = 'Consistency beats intensity. Small daily actions compound into transformation. Focus on your Accelerator KPI this week.'
  }

  return {
    headline,
    topActions: topActions.slice(0, 3),
    metrics,
    streakStatus,
    deadlines,
    coachNote,
  }
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

export async function POST(request: NextRequest) {
  let body: { memory?: CompanyMemory }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { memory } = body
  if (!memory) {
    return NextResponse.json({ error: 'memory is required' }, { status: 400 })
  }

  try {
    const briefing = generateBriefingFromMemory(memory)
    return NextResponse.json({
      briefing,
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[MorningBriefing] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'POST /api/coaching/morning-briefing',
    description: 'DriverOS Daily Morning Briefing — 60-second read',
    usage: 'Send { memory: CompanyMemory } in body',
  })
}
