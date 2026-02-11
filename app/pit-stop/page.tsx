'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useOrg } from '@/components/providers/OrgProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, Clock, AlertTriangle, Target, ArrowRight } from 'lucide-react'
import { getLastWeekSummary, generateWeeklyPlan, type WeeklySummary, type WeeklyPlan } from '@/lib/pit-stop/planning'
import { createAction } from '@/lib/data/actions'
import { createMeeting } from '@/lib/data/meetings'
import { getActiveNorthStar } from '@/lib/data/north-star'
import { useMemoryEvent } from '@/hooks/useMemoryEvent'
import type { Action, NorthStar } from '@/lib/supabase/types'

interface ProposedAction {
  title: string
  why: string
  engine: string
  priority: 'do_now' | 'do_next'
  effort: number
}

function LastWeekSummary({ summary }: { summary: WeeklySummary | null }) {
  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span>Last Week Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <span>Last Week Summary</span>
        </CardTitle>
        <CardDescription>
          Completion rate: {summary.completionRate}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({summary.completed.length})
            </h4>
            {summary.completed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed actions</p>
            ) : (
              <ul className="space-y-1">
                {summary.completed.slice(0, 3).map((action) => (
                  <li key={action.id} className="text-sm">{action.title}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Missed ({summary.missed.length})
            </h4>
            {summary.missed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No missed actions</p>
            ) : (
              <ul className="space-y-1">
                {summary.missed.slice(0, 3).map((action) => (
                  <li key={action.id} className="text-sm">{action.title}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProposedPlan({ 
  plan, 
  onGenerate, 
  isGenerating 
}: { 
  plan: WeeklyPlan | null
  onGenerate: () => void
  isGenerating: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-orange-500" />
          <span>Proposed Plan</span>
        </CardTitle>
        <CardDescription>Rules-based plan for next week (max 3 actions)</CardDescription>
      </CardHeader>
      <CardContent>
        {!plan ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Generate your weekly plan</p>
            <Button onClick={onGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Plan'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{plan.rationale}</p>
            <div className="space-y-3">
              {plan.actions.map((action, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{action.why}</p>
                    </div>
                    <Badge variant={action.priority === 'do_now' ? 'default' : 'secondary'} className={action.priority === 'do_now' ? 'bg-red-500' : ''}>
                      {action.priority === 'do_now' ? 'Do Now' : 'Do Next'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ApprovalSection({ 
  plan, 
  onApprove, 
  isApproving 
}: { 
  plan: WeeklyPlan | null
  onApprove: () => void
  isApproving: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval</CardTitle>
        <CardDescription>Review and approve your weekly plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Ready to commit to this plan?</p>
            <p className="text-xs text-muted-foreground">
              This will create actions and log a pit stop meeting
            </p>
          </div>
          <Button 
            onClick={onApprove} 
            disabled={!plan || isApproving}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {isApproving ? 'Approving...' : 'Approve Plan'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PitStopPage() {
  const { user } = useAuth()
  const { currentOrg } = useOrg()
  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [northStar, setNorthStar] = useState<NorthStar | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fireMemoryEvent = useMemoryEvent()

  useEffect(() => {
    const loadData = async () => {
      if (!user || !currentOrg?.id) return
      try {
        const [weekSummary, ns] = await Promise.all([
          getLastWeekSummary(currentOrg.id),
          getActiveNorthStar(currentOrg.id)
        ])
        setSummary(weekSummary)
        setNorthStar(ns)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      }
    }
    loadData()
  }, [user, currentOrg?.id])

  const handleGenerate = async () => {
    if (!summary || !northStar || !currentOrg?.id) return
    setIsGenerating(true)
    setError(null)
    try {
      const generatedPlan = await generateWeeklyPlan(summary, northStar.goal, currentOrg.id)
      setPlan(generatedPlan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApprove = async () => {
    if (!plan || !user || !northStar) return
    setIsApproving(true)
    setError(null)
    try {
      // Create actions
      for (const action of plan.actions) {
        await createAction({
          title: action.title,
          why: action.why,
          engine: action.engine as any,
          priority: action.priority,
          status: 'not_started',
          effort: action.effort,
          owner: null,
          due_date: null,
          north_star_id: northStar.id,
          source: 'pit_stop',
          description: null
        }, currentOrg?.id, user.id)
      }

      // Create meeting record
      await createMeeting({
        type: 'pit_stop',
        scheduled_for: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        notes: plan.rationale,
        decisions: { approved_actions: plan.actions.length },
        action_ids: []
      }, currentOrg?.id, user.id)

      // Update AI coach memory
      fireMemoryEvent({
        type: 'meeting_held',
        meetingType: 'Pit Stop',
        decisions: plan.actions.map(a => a.title),
      })

      // Reset for next week
      setPlan(null)
      alert('Plan approved! Actions created successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve plan')
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <>
      {/* Gradient mesh background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-500/10 dark:bg-yellow-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Weekly Pit Stop</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Review last week's performance and plan your next three actions. 
            Keep the execution rhythm tight.
          </p>
          <Badge variant="secondary" className="text-sm">
            30-minute focused planning session
          </Badge>
        </div>

        {error && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Week Summary */}
        <LastWeekSummary summary={summary} />

        {/* Proposed Plan */}
        <ProposedPlan plan={plan} onGenerate={handleGenerate} isGenerating={isGenerating} />

        {/* Approval Section */}
        <ApprovalSection plan={plan} onApprove={handleApprove} isApproving={isApproving} />
      </div>
    </>
  )
}