import { FlashScanResult } from '@/lib/types'
import { AcceleratorCard } from './AcceleratorCard'
import { QuickWinsList } from './QuickWinsList'
import { UpgradePrompt } from './UpgradePrompt'
import { AIBadge } from '@/components/ui/AIBadge'
import { TrendingUp, Target, AlertTriangle } from 'lucide-react'

interface InstantAnalysisProps {
  result: FlashScanResult
}

export function InstantAnalysis({ result }: InstantAnalysisProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <AIBadge confidence={result.confidence_score} label="AI Flash Scan" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Instant Analysis</h2>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Gear: {result.gear_estimate.number} - {result.gear_estimate.label}</span>
        </div>
        <p className="text-sm mt-2">{result.gear_estimate.reason}</p>
      </div>

      {/* Industry Insights Panel */}
      {result.industry_insights && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Industry Intelligence
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Business Phase:</span>
              <span className="ml-2 font-medium">{result.industry_insights.phase}</span>
            </div>
            <div>
              <span className="text-muted-foreground">LTV:CAC Target:</span>
              <span className="ml-2 font-medium">{result.industry_insights.ltvCacTarget.min}:1 - {result.industry_insights.ltvCacTarget.ideal}:1</span>
            </div>
            <div>
              <span className="text-muted-foreground">Lead Gen Focus:</span>
              <span className="ml-2 font-medium capitalize">{result.industry_insights.leadGenPriority}</span>
            </div>
          </div>
          {result.industry_insights.topConstraints.length > 0 && (
            <div className="pt-2 border-t border-primary/10">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Common constraints in your industry:
              </span>
              <ul className="text-xs mt-1 space-y-1">
                {result.industry_insights.topConstraints.map((c, i) => (
                  <li key={i} className="text-muted-foreground">• {c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <AcceleratorCard 
        kpi={result.accelerator.kpi}
        notes={result.accelerator.notes}
      />

      <QuickWinsList wins={result.quick_wins} />

      <UpgradePrompt />
    </div>
  )
}
