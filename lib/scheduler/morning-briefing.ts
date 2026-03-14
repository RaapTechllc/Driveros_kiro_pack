/**
 * Morning Briefing Job
 * Generates a 60-second daily digest of what matters TODAY.
 *
 * Pulls: overdue actions, today's check-in status, engine scores,
 * recent blockers, north star progress, and any scheduled meetings.
 */

import type { JobContext, JobResult } from './types'
import { getBackend } from '@/lib/data/backend'

export interface MorningBriefing {
  greeting: string
  date: string
  overallScore: number
  gear: number
  urgentActions: { title: string; engine: string; daysOverdue: number }[]
  todaysFocus: string[]
  recentBlockers: string[]
  checkInStreak: number
  upcomingMeetings: { type: string; scheduledFor: string }[]
  northStarGoal: string | null
  motivationalNudge: string
}

export async function runMorningBriefing(context: JobContext): Promise<JobResult> {
  const start = Date.now()
  const { orgId } = context

  try {
    const backend = await getBackend()

    // Gather data in parallel
    const [actions, checkIns, meetings, northStar, scoringHistory] = await Promise.all([
      backend.getActions(orgId),
      backend.getCheckIns(orgId, 7),
      backend.getMeetings(orgId),
      backend.getNorthStar(orgId),
      backend.getScoringHistory(orgId, undefined, 5),
    ])

    const today = new Date(context.now).toISOString().split('T')[0]
    const dayOfWeek = context.now.toLocaleDateString('en-US', { weekday: 'long', timeZone: context.timezone })

    // Find urgent/overdue actions
    const urgentActions = actions
      .filter(a => a.status !== 'completed' && a.status !== 'parked')
      .filter(a => a.priority === 'do_now' || (a.due_date && a.due_date < today))
      .slice(0, 5)
      .map(a => ({
        title: a.title,
        engine: a.engine || 'general',
        daysOverdue: a.due_date ? Math.max(0, Math.floor((Date.now() - new Date(a.due_date).getTime()) / 86400000)) : 0,
      }))

    // Check-in streak
    const streak = checkIns.filter((c, i) => {
      const expected = new Date(context.now)
      expected.setDate(expected.getDate() - i)
      return c.date === expected.toISOString().split('T')[0]
    }).length

    // Recent blockers from check-ins
    const recentBlockers = checkIns
      .filter(c => c.blocker)
      .slice(0, 3)
      .map(c => c.blocker!)

    // Today's meetings
    const upcomingMeetings = meetings
      .filter(m => m.scheduled_for && m.scheduled_for.startsWith(today))
      .map(m => ({ type: m.type, scheduledFor: m.scheduled_for! }))

    // Latest overall score
    const latestScore = scoringHistory.length > 0 ? scoringHistory[0].overall_score ?? 0 : 0
    const latestGear = scoringHistory.length > 0 ? scoringHistory[0].gear ?? 1 : 1

    // Focus areas: in-progress actions
    const todaysFocus = actions
      .filter(a => a.status === 'in_progress')
      .slice(0, 3)
      .map(a => a.title)

    const briefing: MorningBriefing = {
      greeting: `Good morning! Happy ${dayOfWeek}.`,
      date: today,
      overallScore: Number(latestScore),
      gear: latestGear,
      urgentActions,
      todaysFocus,
      recentBlockers,
      checkInStreak: streak,
      upcomingMeetings,
      northStarGoal: northStar?.goal ?? null,
      motivationalNudge: getMotivationalNudge(streak, urgentActions.length),
    }

    return {
      success: true,
      jobName: 'morning-briefing',
      orgId,
      executedAt: new Date().toISOString(),
      duration: Date.now() - start,
      output: briefing,
    }
  } catch (error) {
    return {
      success: false,
      jobName: 'morning-briefing',
      orgId,
      executedAt: new Date().toISOString(),
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

function getMotivationalNudge(streak: number, urgentCount: number): string {
  if (streak >= 7) return '🔥 7-day streak! You\'re building real momentum.'
  if (streak >= 3) return '💪 Great consistency. Keep the streak alive!'
  if (urgentCount === 0) return '✅ No urgent items — great time for strategic work.'
  if (urgentCount > 3) return `⚡ ${urgentCount} urgent items need your attention today.`
  return '🎯 Stay focused on what moves the needle today.'
}
