'use client'

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Progress } from "@/components/ui/Progress"
import { Gauge, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface BusinessGearIndicatorProps {
  gear: {
    number: number
    label: string
    reason: string
  }
  completionScore: number
}

const gearLabels = {
  1: "Idle",
  2: "Grip",
  3: "Drive",
  4: "Overdrive",
  5: "Apex"
}

const gearColors = {
  1: "bg-gray-500",
  2: "bg-orange-500",
  3: "bg-blue-500",
  4: "bg-green-500",
  5: "bg-emerald-500"
}

export function BusinessGearIndicator({ gear, completionScore }: BusinessGearIndicatorProps) {
  const gearColor = gearColors[gear.number as keyof typeof gearColors] || "bg-gray-500"

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 ${gearColor} opacity-5`} />
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`w-20 h-20 rounded-full ${gearColor} flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
              {gear.number}
            </div>
            <div className="text-left">
              <CardTitle className="text-2xl">Gear: {gear.label}</CardTitle>
              <CardDescription className="text-base">
                Business Phase Assessment
              </CardDescription>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Analysis Complete</span>
              <span className="font-medium">{Math.round(completionScore * 100)}%</span>
            </div>
            <Progress value={completionScore * 100} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="text-center">
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {gear.reason}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

interface EngineCardProps {
  engine: {
    name: string
    score: number
    status: 'green' | 'yellow' | 'red' | 'unknown'
    rationale: string
    next_action: string
  }
  trend?: 'up' | 'down' | 'stable' | 'new'
}

const statusColors = {
  green: "bg-green-100 text-green-800 border-green-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  red: "bg-red-100 text-red-800 border-red-200",
  unknown: "bg-gray-100 text-gray-800 border-gray-200"
}

const statusGlow = {
  green: "hover:shadow-[0_0_25px_rgba(34,197,94,0.25)]",
  yellow: "hover:shadow-[0_0_25px_rgba(234,179,8,0.25)]",
  red: "hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]",
  unknown: ""
}

const statusIcons = {
  green: CheckCircle,
  yellow: AlertTriangle,
  red: AlertTriangle,
  unknown: Clock
}

const trendDisplay = {
  up: { arrow: '↑', color: 'text-green-600', label: 'Improving' },
  down: { arrow: '↓', color: 'text-red-600', label: 'Declining' },
  stable: { arrow: '→', color: 'text-gray-500', label: 'Stable' },
  new: { arrow: '●', color: 'text-blue-500', label: 'New' }
}

export function EngineCard({ engine, trend }: EngineCardProps) {
  const StatusIcon = statusIcons[engine.status]
  const statusColor = statusColors[engine.status]
  const glowClass = statusGlow[engine.status]
  const trendInfo = trend ? trendDisplay[trend] : null

  // Calculate gauge dasharray for 0-100 score (circumference ~ 126 for r=20)
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - ((engine.score || 0) / 100) * circumference

  const scoreColor = engine.score >= 80 ? 'text-green-500' : engine.score >= 50 ? 'text-yellow-500' : 'text-red-500'
  const ringColor = engine.score >= 80 ? 'stroke-green-500' : engine.score >= 50 ? 'stroke-yellow-500' : 'stroke-red-500'

  return (
    <Card className={`h-full ${glowClass} transition-shadow duration-300`}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {engine.name}
            {trendInfo && (
              <span className={`text-base ${trendInfo.color}`} title={trendInfo.label}>
                {trendInfo.arrow}
              </span>
            )}
          </CardTitle>
          <Badge className={`${statusColor} capitalize px-2 py-0.5`}>
            {engine.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Gauge and Action Row */}
        <div className="flex items-start gap-4">

          {/* Score Gauge */}
          <div className="relative h-20 w-20 flex-shrink-0 flex items-center justify-center">
            <div className="text-center z-10">
              <span className={`text-2xl font-bold ${scoreColor}`}>
                {engine.score > 0 ? engine.score : '-'}
              </span>
            </div>
            {/* SVG Ring */}
            <svg className="absolute inset-0 transform -rotate-90 h-full w-full">
              <circle
                cx="40" cy="40" r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-muted/20"
              />
              <circle
                cx="40" cy="40" r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`${ringColor} transition-all duration-1000 ease-out`}
              />
            </svg>
          </div>

          {/* Action Snippet */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 text-sm font-medium text-foreground">
              <div className="p-1 rounded bg-muted">
                <Clock className="w-3 h-3" />
              </div>
              <span>Next Action</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {engine.next_action}
            </p>
          </div>
        </div>

        {/* Assessment Rationale */}
        <div className="bg-muted/30 p-3 rounded-lg text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground mr-1">Insight:</span>
          {engine.rationale}
        </div>
      </CardContent>
    </Card>
  )
}

interface AcceleratorCardProps {
  accelerator: {
    kpi: string
    cadence: string
    recommended: boolean
    notes: string
  }
}

export function AcceleratorCard({ accelerator }: AcceleratorCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Weekly Accelerator</CardTitle>
          {accelerator.recommended && (
            <Badge variant="secondary">Recommended</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-1">Key Performance Indicator</h4>
            <p className="text-lg font-semibold">{accelerator.kpi}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Cadence</h4>
            <p className="text-sm text-muted-foreground capitalize">{accelerator.cadence}</p>
          </div>

          {accelerator.notes && (
            <div>
              <h4 className="text-sm font-medium mb-1">Notes</h4>
              <p className="text-sm text-muted-foreground">{accelerator.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
