/**
 * Weekly Scorecard Job
 * Auto-generates a weekly scorecard document every Monday.
 */

import type { JobContext, JobResult } from './types'
import { getBackend } from '@/lib/data/backend'
import { generateDocument } from '@/lib/documents/pdf-generator'
import type { WeeklyScorecardData, EngineScoreData } from '@/lib/documents/types'
import type { EngineName } from '@/lib/supabase/types'

const ENGINES: EngineName[] = ['vision', 'people', 'operations', 'revenue', 'finance']

export async function runWeeklyScorecard(context: JobContext): Promise<JobResult> {
  const start = Date.now()
  const { orgId } = context

  try {
    const backend = await getBackend()

    const weekAgo = new Date(context.now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekStart = weekAgo.toISOString().split('T')[0]

    const [actions, checkIns, northStar, brandConfig] = await Promise.all([
      backend.getActions(orgId),
      backend.getCheckIns(orgId, 7),
      backend.getNorthStar(orgId),
      backend.getBrandConfig(orgId),
    ])

    // Engine scores: latest per engine
    const engineScores: EngineScoreData[] = await Promise.all(
      ENGINES.map(async (engine) => {
        const history = await backend.getScoringHistory(orgId, engine, 2)
        const latest = history[0]?.score ?? 0
        const previous = history[1]?.score ?? latest
        const change = latest - previous
        return {
          engine,
          score: Number(latest),
          maxScore: 100,
          trend: (change > 0 ? 'up' : change < 0 ? 'down' : 'flat') as 'up' | 'down' | 'flat',
          changePercent: Math.abs(Math.round(change)),
        }
      })
    )

    const overallScore = Math.round(engineScores.reduce((sum, e) => sum + e.score, 0) / 5)

    // Actions stats this week
    const actionsCompleted = actions.filter(
      a => a.status === 'completed' && a.updated_at >= weekStart
    ).length
    const actionsTotal = actions.filter(a => a.status !== 'parked').length

    // Wins and blockers from check-ins
    const topWins = checkIns
      .filter(c => c.win_or_lesson)
      .map(c => c.win_or_lesson!)
      .slice(0, 3)

    const topBlockers = checkIns
      .filter(c => c.blocker)
      .map(c => c.blocker!)
      .slice(0, 3)

    // Next week focus: do_now actions
    const nextWeekFocus = actions
      .filter(a => a.priority === 'do_now' && a.status !== 'completed')
      .slice(0, 3)
      .map(a => a.title)

    // Check-in streak
    const checkInStreak = checkIns.length

    const data: WeeklyScorecardData = {
      orgName: northStar?.goal ? `Goal: ${northStar.goal}` : 'DriverOS',
      weekOf: weekStart,
      overallScore,
      gear: Math.min(5, Math.max(1, Math.ceil(overallScore / 20))),
      engineScores,
      actionsCompleted,
      actionsTotal,
      checkInStreak,
      topWins,
      topBlockers,
      nextWeekFocus,
    }

    const doc = await generateDocument({
      config: {
        orgId,
        title: `Weekly Scorecard — ${weekStart}`,
        template: 'weekly-scorecard',
        brandConfig,
      },
      data: data as unknown as Record<string, unknown>,
    })

    return {
      success: true,
      jobName: 'weekly-scorecard',
      orgId,
      executedAt: new Date().toISOString(),
      duration: Date.now() - start,
      output: { documentId: doc.id, title: doc.title, scorecard: data },
    }
  } catch (error) {
    return {
      success: false,
      jobName: 'weekly-scorecard',
      orgId,
      executedAt: new Date().toISOString(),
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
