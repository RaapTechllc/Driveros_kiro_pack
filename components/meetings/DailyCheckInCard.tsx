'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { CheckCircle2, Flag } from 'lucide-react'

export function DailyCheckInCard() {
  const [actionsCompleted, setActionsCompleted] = useState(false)
  const [blocker, setBlocker] = useState('')
  const [winOrLesson, setWinOrLesson] = useState('')

  const handleSubmit = () => {
    // TODO: Implement submission logic
    console.log('Daily check-in submitted:', {
      actionsCompleted,
      blocker,
      winOrLesson
    })
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
            className="w-full min-h-[80px] px-3 py-2 text-sm bg-background border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            className="w-full min-h-[80px] px-3 py-2 text-sm bg-background border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </CardContent>

      <CardFooter>
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          Submit Check-In
        </button>
      </CardFooter>
    </Card>
  )
}