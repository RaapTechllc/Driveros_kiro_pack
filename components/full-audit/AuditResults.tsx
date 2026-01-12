import { FullAuditResult, EngineResult } from '@/lib/full-audit-analysis'
import { Button } from '@/components/ui/Button'
import { AIBadge } from '@/components/ui/AIBadge'
import Link from 'next/link'

interface AuditResultsProps {
  result: FullAuditResult
}

function EngineCard({ engine }: { engine: EngineResult }) {
  const statusColors = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold">{engine.name}</h4>
        <div className="text-right">
          <div className="text-2xl font-bold">{engine.score}</div>
          <div className={`text-xs px-2 py-1 rounded ${statusColors[engine.status]}`}>
            {engine.status.toUpperCase()}
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{engine.rationale}</p>
      <div className="text-sm">
        <strong>Next Action:</strong> {engine.next_action}
      </div>
    </div>
  )
}

export function AuditResults({ result }: AuditResultsProps) {
  if (result.status === 'needs_more_data') {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold">Assessment Incomplete</h2>
        <p>Complete at least 70% of the assessment to get your full analysis.</p>
        <p className="text-sm text-muted-foreground">
          Current completion: {Math.round(result.completion_score * 100)}%
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-3">
          <AIBadge confidence={Math.round(result.completion_score * 100)} label="AI Full Audit" />
        </div>
        <h2 className="text-3xl font-bold">Your Full Analysis</h2>
        <div className="flex items-center justify-center gap-6 text-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{result.gear.number}</div>
            <div className="text-sm text-muted-foreground">Gear: {result.gear.label}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{Math.round(result.completion_score * 100)}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </div>
        <p className="text-muted-foreground">{result.gear.reason}</p>
      </div>

      {/* Accelerator */}
      <div className="bg-primary text-primary-foreground p-6 rounded-lg text-center">
        <h3 className="text-lg font-semibold mb-2">Weekly Accelerator</h3>
        <div className="text-2xl font-bold mb-2">{result.accelerator.kpi}</div>
        <p className="text-sm opacity-90">{result.accelerator.notes}</p>
      </div>

      {/* Signal Board - 5 Engines */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Signal Board</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.engines.map((engine, index) => (
            <EngineCard key={index} engine={engine} />
          ))}
        </div>
      </div>

      {/* Brakes */}
      {result.brakes.flags.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-yellow-800 dark:text-yellow-200">
            ⚠️ Brakes - Risk Level: {result.brakes.risk_level.toUpperCase()}
          </h3>
          <div className="space-y-2">
            <div>
              <strong>Flags:</strong>
              <ul className="list-disc list-inside text-sm mt-1">
                {result.brakes.flags.map((flag, index) => (
                  <li key={index}>{flag}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Controls:</strong>
              <ul className="list-disc list-inside text-sm mt-1">
                {result.brakes.controls.map((control, index) => (
                  <li key={index}>{control}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Bay */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Do Now</h3>
          <div className="space-y-2">
            {result.actions.do_now.map((action, index) => (
              <div key={index} className="border rounded p-3">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.why}</div>
                <div className="text-xs mt-1">
                  Owner: {action.owner_role} • {action.eta_days}d • {action.engine}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Do Next</h3>
          <div className="space-y-2">
            {result.actions.do_next.map((action, index) => (
              <div key={index} className="border rounded p-3">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.why}</div>
                <div className="text-xs mt-1">
                  Owner: {action.owner_role} • {action.eta_days}d • {action.engine}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard CTA */}
      <div className="text-center space-y-4 p-6 bg-secondary rounded-lg">
        <h3 className="text-lg font-semibold">Ready for Your Dashboard?</h3>
        <p className="text-muted-foreground">
          View your complete analysis, export actions, and track progress.
        </p>
        <Link href="/dashboard">
          <Button size="lg">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
