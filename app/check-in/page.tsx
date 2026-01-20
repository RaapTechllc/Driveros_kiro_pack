'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useOrg } from '@/components/providers/OrgProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { createCheckIn, getTodayCheckIn } from '@/lib/data/check-ins'
import type { CheckIn } from '@/lib/supabase/types'

export default function CheckInPage() {
  const { user } = useAuth()
  const { currentOrg } = useOrg()
  const [existingCheckIn, setExistingCheckIn] = useState<CheckIn | null>(null)
  const [actionsCompleted, setActionsCompleted] = useState(false)
  const [blocker, setBlocker] = useState('')
  const [winOrLesson, setWinOrLesson] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadTodayCheckIn = async () => {
      if (!user || !currentOrg?.id) return
      try {
        const checkIn = await getTodayCheckIn(currentOrg.id, user.id)
        if (checkIn) {
          setExistingCheckIn(checkIn)
          setActionsCompleted(checkIn.actions_completed ?? false)
          setBlocker(checkIn.blocker ?? '')
          setWinOrLesson(checkIn.win_or_lesson ?? '')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load check-in')
      }
    }

    loadTodayCheckIn()
  }, [user, currentOrg?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    try {
      await createCheckIn(
        {
          org_id: currentOrg?.id ?? 'demo-org',
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          actions_completed: actionsCompleted,
          blocker: blocker.trim() || null,
          win_or_lesson: winOrLesson.trim() || null,
          action_updates: null,
        }
      )
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save check-in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Daily Check-In</h1>
        <p className="text-muted-foreground mt-1">
          Quick 1-minute habit loop to track execution
        </p>
      </div>

      {error && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              <p>Check-in saved successfully!</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Today's Check-In</CardTitle>
          <CardDescription>
            {existingCheckIn ? 'Update your check-in for today' : 'Complete your daily check-in'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Actions Completed */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="actions-completed"
                checked={actionsCompleted}
                onChange={(e) => setActionsCompleted(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="actions-completed" className="flex-1">
                <div className="font-medium">Did you complete your 1-3 actions?</div>
                <div className="text-sm text-muted-foreground">
                  Check if you made progress on your key actions today
                </div>
              </label>
            </div>

            {/* Blocker */}
            <div className="space-y-2">
              <label htmlFor="blocker" className="block font-medium">
                Any blockers?
              </label>
              <textarea
                id="blocker"
                value={blocker}
                onChange={(e) => setBlocker(e.target.value)}
                placeholder="What's preventing progress? (optional)"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Win or Lesson */}
            <div className="space-y-2">
              <label htmlFor="win-or-lesson" className="block font-medium">
                Any win or lesson?
              </label>
              <textarea
                id="win-or-lesson"
                value={winOrLesson}
                onChange={(e) => setWinOrLesson(e.target.value)}
                placeholder="What did you learn or achieve? (optional)"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Saving...' : existingCheckIn ? 'Update Check-In' : 'Complete Check-In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
