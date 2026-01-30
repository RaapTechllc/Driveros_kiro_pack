'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { CheckCircle2, Flag, Loader2 } from 'lucide-react'

export function DailyCheckInCard() {
  const [actionsCompleted, setActionsCompleted] = useState(false)
  const [blocker, setBlocker] = useState('')
  const [winOrLesson, setWinOrLesson] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    // Validate: at least one field should have content
    if (!actionsCompleted && !blocker.trim() && !winOrLesson.trim()) {
      setSubmitError('Please complete at least one field before submitting.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Create check-in record
      const checkIn = {
        id: `checkin-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        actionsCompleted,
        blocker: blocker.trim() || null,
        winOrLesson: winOrLesson.trim() || null,
      }

      // Save to localStorage
      const existingCheckIns = JSON.parse(localStorage.getItem('daily-check-ins') || '[]')
      existingCheckIns.unshift(checkIn)
      localStorage.setItem('daily-check-ins', JSON.stringify(existingCheckIns.slice(0, 90))) // Keep last 90 days

      // Reset form and show success
      setActionsCompleted(false)
      setBlocker('')
      setWinOrLesson('')
      setSubmitSuccess(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error) {
      setSubmitError('Failed to save check-in. Please try again.')
      console.error('Check-in submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flag className="w-5 h-5 text-primary" />
          Daily Check-In
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Actions Completed Checkbox */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActionsCompleted(!actionsCompleted)}
            className={`
              flex items-center justify-center w-5 h-5 rounded border-2 transition-all
              ${actionsCompleted 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground hover:border-primary'
              }
            `}
          >
            {actionsCompleted && <CheckCircle2 className="w-3 h-3" />}
          </button>
          <label className="text-sm font-medium cursor-pointer" onClick={() => setActionsCompleted(!actionsCompleted)}>
            Actions completed today
          </label>
        </div>

        {/* Blocker Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            What's blocking progress?
          </label>
          <textarea
            value={blocker}
            onChange={(e) => setBlocker(e.target.value)}
            placeholder="Describe any blockers or challenges..."
            className="w-full min-h-[80px] px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Win or Lesson Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Today's win or lesson
          </label>
          <textarea
            value={winOrLesson}
            onChange={(e) => setWinOrLesson(e.target.value)}
            placeholder="Share a win or key lesson learned..."
            className="w-full min-h-[80px] px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        {submitError && (
          <p className="text-sm text-destructive w-full text-center">{submitError}</p>
        )}
        {submitSuccess && (
          <p className="text-sm text-green-600 dark:text-green-400 w-full text-center">✓ Check-in saved successfully!</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Submit Check-In'
          )}
        </button>
      </CardFooter>
    </Card>
  )
}