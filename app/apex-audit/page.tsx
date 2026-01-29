'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApexAuditForm } from '@/components/apex-audit/ApexAuditForm'
import { ApexAuditResults } from '@/components/apex-audit/ApexAuditResults'
import { ApexAuditData, ApexAuditResult } from '@/lib/apex-audit-types'
import { AppLayout } from '@/components/layout/AppLayout'
import { Crown, Clock, FileText, CheckCircle2 } from 'lucide-react'
import { analyzeApexAudit } from '@/lib/apex-audit-analysis'

export default function ApexAuditPage() {
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apexResult, setApexResult] = useState<ApexAuditResult | null>(null)

  const handleSubmit = async (data: ApexAuditData) => {
    setIsSubmitting(true)

    // Run instant Apex analysis
    const analysis = analyzeApexAudit(data)
    setApexResult(analysis)

    // Simulate network delay for the "heavy lifting" submission
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Save to localStorage
    const submissionId = crypto.randomUUID()
    const submission = {
      id: submissionId,
      submittedAt: new Date().toISOString(),
      status: 'pending_review',
      data: data,
      preliminary_insights: analysis
    }

    const existing = JSON.parse(localStorage.getItem('apex_audit_submissions') || '[]')
    localStorage.setItem('apex_audit_submissions', JSON.stringify([submission, ...existing]))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted && apexResult) {
    return (
      <div className="max-w-6xl mx-auto pb-20">

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
            <span className="text-muted-foreground">Preliminary Analysis Generated Below</span>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <ApexAuditResults
            result={apexResult}
            onViewDashboard={() => router.push('/dashboard')}
          />
        </div>
      </div>
    )
  }

  if (isSubmitting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin-slow" />
            <div className="absolute inset-4 rounded-full border-4 border-primary/40 animate-spin-reverse" />
            <div className="absolute inset-8 rounded-full bg-primary/20 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analyzing Business Architecture</h2>
            <p className="text-muted-foreground mt-2">Calculating health scores and bottlenecks...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
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
  )
}
