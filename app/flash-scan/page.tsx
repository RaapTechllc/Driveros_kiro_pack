'use client'

import { useState } from 'react'
import { CompanyBasicsForm } from '@/components/flash-scan/CompanyBasicsForm'
import { InstantAnalysis } from '@/components/flash-scan/InstantAnalysis'
import { analyzeFlashScan } from '@/lib/flash-analysis'
import { FlashScanData, FlashScanResult } from '@/lib/types'

export default function FlashScanPage() {
  const [result, setResult] = useState<FlashScanResult | null>(null)

  const handleFormSubmit = (data: FlashScanData) => {
    const analysis = analyzeFlashScan(data)
    setResult(analysis)

    // Save to localStorage for potential upgrade path
    localStorage.setItem('flash-scan-data', JSON.stringify(data))
    localStorage.setItem('flash-scan-result', JSON.stringify(analysis))
  }

  return (
    <>
      {!result ? (
        <CompanyBasicsForm onSubmit={handleFormSubmit} />
      ) : (
        <InstantAnalysis result={result} />
      )}
    </>
  )
}
