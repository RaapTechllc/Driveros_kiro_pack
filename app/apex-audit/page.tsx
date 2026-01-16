'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApexAuditForm } from '@/components/apex-audit/ApexAuditForm'
import { ApexAuditResults } from '@/components/apex-audit/ApexAuditResults'
import { ApexAuditData, ApexAuditResult } from '@/lib/apex-audit-types'
import { analyzeApexAudit } from '@/lib/apex-audit-analysis'
import { AppLayout } from '@/components/layout/AppLayout'
import { Crown, Clock, FileText } from 'lucide-react'

export default function ApexAuditPage() {
  const router = useRouter()
  const [result, setResult] = useState<ApexAuditResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleSubmit = async (data: ApexAuditData) => {
    setIsAnalyzing(true)
    
    // Simulate analysis time for premium feel
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const analysisResult = analyzeApexAudit(data)
    
    // Store in localStorage
    localStorage.setItem('apex_audit_data', JSON.stringify(data))
    localStorage.setItem('apex_audit_result', JSON.stringify(analysisResult))
    
    setResult(analysisResult)
    setIsAnalyzing(false)
  }

  const handleViewDashboard = () => {
    router.push('/dashboard')
  }

  if (isAnalyzing) {
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
              <h2 className="text-2xl font-bold text-foreground">Analyzing Your Business</h2>
              <p className="text-muted-foreground mt-2">Running comprehensive analysis across all dimensions...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (result) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-foreground">Apex Audit Results</h1>
            </div>
            <p className="text-muted-foreground">Your comprehensive business analysis is ready.</p>
          </div>
          <ApexAuditResults result={result} onViewDashboard={handleViewDashboard} />
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
              <span>Executive-level insights</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 rounded-2xl bg-card border-2 border-border">
          <ApexAuditForm onSubmit={handleSubmit} />
        </div>
      </div>
    </AppLayout>
  )
}
