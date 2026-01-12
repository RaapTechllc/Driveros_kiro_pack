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
  
  return (
    <Card className={`h-full ${glowClass}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{engine.name}</CardTitle>
          <Badge className={`${statusColor} capitalize`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {engine.status}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">
            {engine.score > 0 ? engine.score : '—'}
          </div>
          {engine.score > 0 ? (
            <div className="text-sm text-muted-foreground">/100</div>
          ) : (
            <div className="text-xs text-muted-foreground">Analysis needed</div>
          )}
          {trendInfo && (
            <span className={`text-lg ${trendInfo.color}`} title={trendInfo.label}>
              {trendInfo.arrow}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-1">Assessment</h4>
          <p className="text-sm text-muted-foreground">{engine.rationale}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-1">Next Action</h4>
          <p className="text-sm text-muted-foreground">{engine.next_action}</p>
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
