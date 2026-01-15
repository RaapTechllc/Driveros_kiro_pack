'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Target } from 'lucide-react'
import { getGoalCurrent, setGoalCurrent } from '@/lib/goal-progress'

interface GoalProgressProps {
  northStar?: {
    title: string
    metric?: string
    current?: number | null
    target?: number | null
    due_date?: string | null
  }
  departments?: Array<{
    department: string
    title: string
    metric?: string
    current?: number | null
    target?: number | null
    due_date?: string | null
    alignment_statement?: string
  }>
}

function calcProgress(current?: number | null, target?: number | null): number | null {
  if (current == null || target == null || target === 0) return null
  return Math.min(100, Math.round((current / target) * 100))
}

function getStatusColor(pct: number | null): string {
  if (pct === null) return 'bg-gray-200 dark:bg-gray-700'
  if (pct >= 70) return 'bg-green-500'
  if (pct >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

function EditableProgress({ title, initialCurrent, target, label }: { 
  title: string
  initialCurrent?: number | null
  target?: number | null
  label?: string 
}) {
  const [current, setCurrent] = useState<number | null>(initialCurrent ?? null)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = getGoalCurrent(title)
    if (stored !== null) setCurrent(stored)
  }, [title])

  const pct = calcProgress(current, target)
  const color = getStatusColor(pct)

  const handleSave = (value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      setCurrent(num)
      setGoalCurrent(title, num)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
    setEditing(false)
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label || 'Progress'}</span>
        <span>{pct !== null ? `${pct}%` : 'No data'}{saved && ' ✓'}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct || 0}%` }} />
      </div>
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        {editing ? (
          <input
            type="number"
            defaultValue={current ?? ''}
            autoFocus
            className="w-16 px-1 border rounded text-xs"
            onBlur={(e) => handleSave(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave((e.target as HTMLInputElement).value)}
          />
        ) : (
          <button 
            type="button"
            onClick={() => setEditing(true)}
            className="hover:underline cursor-pointer"
            title="Click to edit"
          >
            {current ?? '—'}
          </button>
        )}
        {target !== null && <span>/ {target}</span>}
      </div>
    </div>
  )
}

export function GoalProgress({ northStar, departments = [] }: GoalProgressProps) {
  if (!northStar?.title && departments.length === 0) return null

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <Target className="h-6 w-6" />
        Goal Progress
      </h2>

      {northStar?.title && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">North Star</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{northStar.title}</p>
            <EditableProgress title={northStar.title} initialCurrent={northStar.current} target={northStar.target} label={northStar.metric || 'Progress'} />
            {northStar.due_date && <p className="text-xs text-muted-foreground">Due: {northStar.due_date}</p>}
          </CardContent>
        </Card>
      )}

      {departments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map((goal, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{goal.department}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{goal.title}</p>
                <EditableProgress title={goal.title} initialCurrent={goal.current} target={goal.target} label={goal.metric} />
                {goal.alignment_statement && (
                  <p className="text-xs text-muted-foreground italic">{goal.alignment_statement}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
