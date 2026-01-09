import { FlashScanResult } from '@/lib/types'
import { AcceleratorCard } from './AcceleratorCard'
import { QuickWinsList } from './QuickWinsList'
import { UpgradePrompt } from './UpgradePrompt'

interface InstantAnalysisProps {
  result: FlashScanResult
}

export function InstantAnalysis({ result }: InstantAnalysisProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Your Instant Analysis</h2>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Gear: {result.gear_estimate.number} - {result.gear_estimate.label}</span>
        </div>
        <p className="text-sm mt-2">{result.gear_estimate.reason}</p>
      </div>

      <AcceleratorCard 
        kpi={result.accelerator.kpi}
        notes={result.accelerator.notes}
      />

      <QuickWinsList wins={result.quick_wins} />

      <UpgradePrompt />
    </div>
  )
}
