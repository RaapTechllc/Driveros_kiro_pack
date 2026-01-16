'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApexAuditForm } from '@/components/apex-audit/ApexAuditForm'
import { ApexAuditData } from '@/lib/apex-audit-types'
import { AppLayout } from '@/components/layout/AppLayout'
import { Crown, Clock, FileText, CheckCircle2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { analyzeFlashScan } from '@/lib/flash-analysis'
import { FlashScanData, FlashScanResult } from '@/lib/types'
import { AcceleratorCard } from '@/components/flash-scan/AcceleratorCard'
import { QuickWinsList } from '@/components/flash-scan/QuickWinsList'
import { AIBadge } from '@/components/ui/AIBadge'

export default function ApexAuditPage() {
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [flashResult, setFlashResult] = useState<FlashScanResult | null>(null)

  const handleSubmit = async (data: ApexAuditData) => {
    setIsSubmitting(true)

    // Generate Flash Scan insights immediately
    const flashData: FlashScanData = {
      industry: data.industry,
      size_band: data.employees,
      role: 'Owner', // Default for Apex flow
      north_star: `Revenue Goal: $${data.revenue_goal_12mo}`,
      top_constraint: data.biggest_constraint
    }

    // Run instant analysis
    const instantResult = analyzeFlashScan(flashData)
    setFlashResult(instantResult)

    // Simulate network delay for the "heavy lifting" submission
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Save to localStorage
    const submissionId = crypto.randomUUID()
    const submission = {
      id: submissionId,
      submittedAt: new Date().toISOString(),
      status: 'pending_review',
      data: data,
      preliminary_insights: instantResult
    }

    const existing = JSON.parse(localStorage.getItem('apex_audit_submissions') || '[]')
    localStorage.setItem('apex_audit_submissions', JSON.stringify([submission, ...existing]))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted && flashResult) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto pb-20">

          {/* Success Banner */}
          <div className="text-center space-y-4 py-8 mb-8 border-b border-border">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Audit Submitted for Expert Review</h2>
              <p className="text-muted-foreground mt-2">
                Your full strategic roadmap will be ready in 24-48 hours.
              </p>
            </div>

            <div className="inline-flex items-center gap-4 bg-muted/30 px-4 py-2 rounded-full text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                Status: <span className="font-medium text-yellow-500">Pending Review</span>
              </span>
              <span className="w-px h-4 bg-border" />
              <span className="text-muted-foreground">Demo Mode: <span className="underline cursor-pointer hover:text-primary" onClick={() => router.push('/admin/apex-reviews')}>Review in Admin</span></span>
            </div>
          </div>

          {/* Preliminary Insights */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Preliminary AI Insights</h3>
                <p className="text-muted-foreground text-sm">Immediate findings based on your profile while you wait.</p>
              </div>
              <AIBadge confidence={flashResult.confidence_score} label="Instant Analysis" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gear Panel */}
              <div className="p-6 rounded-xl bg-card border border-border">
                <h4 className="font-semibold mb-2">Business Phase Estimate</h4>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">Gear {flashResult.gear_estimate.number}</span>
                  <span className="text-lg font-medium text-foreground">{flashResult.gear_estimate.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{flashResult.gear_estimate.reason}</p>
              </div>

              {/* Industry Panel */}
              {flashResult.industry_insights && (
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Industry Intelligence
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Typical Phase:</span>
                      <span className="font-medium">{flashResult.industry_insights.phase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LTV:CAC Target:</span>
                      <span className="font-medium">{flashResult.industry_insights.ltvCacTarget.min}:1 - {flashResult.industry_insights.ltvCacTarget.ideal}:1</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Wins */}
            <div>
              <h4 className="font-semibold mb-4">Immediate Actions</h4>
              <QuickWinsList wins={flashResult.quick_wins} />
            </div>

            {/* Accelerator */}
            <AcceleratorCard
              kpi={flashResult.accelerator.kpi}
              notes={flashResult.accelerator.notes}
            />

            <div className="flex justify-center pt-8">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full max-w-sm"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (isSubmitting) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin-slow" />
              <div className="absolute inset-4 rounded-full border-4 border-primary/40 animate-spin-reverse" />
              <div className="absolute inset-8 rounded-full bg-primary/20 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Submitting Data</h2>
              <p className="text-muted-foreground mt-2">Securely transferring your business profile...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Apex Audit</h1>
              <p className="text-muted-foreground">The full picture. The real numbers. The path forward.</p>
            </div>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>30-45 minutes</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span>80+ data points</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
              <Crown className="w-4 h-4" />
              <span>Expert Review</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 rounded-2xl bg-card border-2 border-border mb-8">
          <ApexAuditForm onSubmit={handleSubmit} />
        </div>
      </div>
    </AppLayout>
  )
}
