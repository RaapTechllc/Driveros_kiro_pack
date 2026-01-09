'use client'

import { useState, useEffect } from 'react'
import { YearBoard } from '@/components/year-board/YearBoard'
import { EmptyState } from '@/components/year-board/EmptyState'
import { loadYearPlan } from '@/lib/year-board-storage'

export default function YearBoardPage() {
  const [hasYearPlan, setHasYearPlan] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if year plan exists
    const yearPlan = loadYearPlan()
    setHasYearPlan(!!yearPlan)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-lg">Loading Year Board...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Year Board</h1>
        <p className="text-muted-foreground">
          Plan your year with quarterly milestones, plays, and rituals aligned to your North Star.
        </p>
      </div>

      {hasYearPlan ? (
        <YearBoard onPlanChange={() => setHasYearPlan(true)} />
      ) : (
        <EmptyState onPlanCreated={() => setHasYearPlan(true)} />
      )}
    </div>
  )
}
