'use client'

import { useState } from 'react'
import { CompanyBasicsForm } from '@/components/flash-scan/CompanyBasicsForm'
import { InstantAnalysis } from '@/components/flash-scan/InstantAnalysis'
import { analyzeFlashScan } from '@/lib/flash-analysis'
import { FlashScanData, FlashScanResult } from '@/lib/types'
import { useFormSubmit } from '@/hooks/useFormSubmit'

export default function FlashScanPage() {
  const [result, setResult] = useState<FlashScanResult | null>(null)
  const { submitState, progress, handleSubmit } = useFormSubmit({
    minLoadingTime: 1200,
    successDuration: 800
  })

  const handleFormSubmit = async (data: FlashScanData) => {
    const analysisResult = await handleSubmit(() => {
      // Simulate AI processing with slight delay
      return new Promise<FlashScanResult>((resolve) => {
        setTimeout(() => {
          const analysis = analyzeFlashScan(data)

          // Save to localStorage for potential upgrade path
          localStorage.setItem('flash-scan-data', JSON.stringify(data))
          localStorage.setItem('flash-scan-result', JSON.stringify(analysis))

          resolve(analysis)
        }, 100)
      })
    })

    if (analysisResult) {
      // Small delay before showing results for smooth transition
      setTimeout(() => setResult(analysisResult), 200)
    }
  }

  return (
    <>
      {!result ? (
        <CompanyBasicsForm
          onSubmit={handleFormSubmit}
          submitState={submitState}
          progress={progress}
        />
      ) : (
        <InstantAnalysis result={result} />
      )}
    </>
  )
}
