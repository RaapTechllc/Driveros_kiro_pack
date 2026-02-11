'use client'

import { useState, useEffect } from 'react'
import { AuditForm } from '@/components/full-audit/AuditForm'
import { AuditResults } from '@/components/full-audit/AuditResults'
import { analyzeFullAudit, FullAuditData, FullAuditResult } from '@/lib/full-audit-analysis'
import { FlashScanData } from '@/lib/types'
import { useMemoryEvent } from '@/hooks/useMemoryEvent'
import type { FrameworkEngineName } from '@/lib/types'

export default function FullAuditPage() {
  const [result, setResult] = useState<FullAuditResult | null>(null)
  const [flashScanData, setFlashScanData] = useState<FlashScanData | null>(null)
  const fireMemoryEvent = useMemoryEvent()

  useEffect(() => {
    // Load Flash Scan data if available
    const savedData = localStorage.getItem('flash-scan-data')
    if (savedData) {
      setFlashScanData(JSON.parse(savedData))
    }
  }, [])

  const handleFormSubmit = (data: FullAuditData) => {
    const analysis = analyzeFullAudit(data)
    setResult(analysis)

    // Save to localStorage
    localStorage.setItem('full-audit-data', JSON.stringify(data))
    localStorage.setItem('full-audit-result', JSON.stringify(analysis))

    // Update AI memory with engine scores
    if (analysis.engines) {
      const scores: Partial<Record<FrameworkEngineName, number>> = {}
      for (const engine of analysis.engines) {
        scores[engine.name as FrameworkEngineName] = engine.score
      }
      fireMemoryEvent({
        type: 'assessment_completed',
        assessmentType: 'full',
        scores,
        gear: analysis.gear?.number as 1 | 2 | 3 | 4 | 5 | undefined,
      })
    }
  }

  return (
    <>
      {!result ? (
        <AuditForm
          initialData={flashScanData || undefined}
          onSubmit={handleFormSubmit}
        />
      ) : (
        <AuditResults result={result} />
      )}
    </>
  )
}
