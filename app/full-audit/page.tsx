'use client'

import { useState, useEffect } from 'react'
import { AuditForm } from '@/components/full-audit/AuditForm'
import { AuditResults } from '@/components/full-audit/AuditResults'
import { analyzeFullAudit, FullAuditData, FullAuditResult } from '@/lib/full-audit-analysis'
import { FlashScanData } from '@/lib/types'

export default function FullAuditPage() {
  const [result, setResult] = useState<FullAuditResult | null>(null)
  const [flashScanData, setFlashScanData] = useState<FlashScanData | null>(null)

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
