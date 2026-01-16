import { FullAuditResult, EngineResult } from '@/lib/full-audit-analysis'
import { Button } from '@/components/ui/Button'
import { AIBadge } from '@/components/ui/AIBadge'
import { CheckCircle2, AlertTriangle, ArrowRight, Activity, TrendingUp, ShieldAlert, FileText, Download } from 'lucide-react'
import Link from 'next/link'

interface AuditResultsProps {
  result: FullAuditResult
}

function EngineCard({ engine }: { engine: EngineResult }) {
  const statusConfig = {
    green: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800', icon: CheckCircle2 },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', icon: Activity },
    red: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', icon: AlertTriangle }
  }

  const config = statusConfig[engine.status]
  const Icon = config.icon

  return (
    <div className={`border rounded-xl p-5 space-y-4 transition-all hover:shadow-md ${config.border} ${config.bg}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-background border ${config.border}`}>
            <Icon className={`w-5 h-5 ${config.text}`} />
          </div>
          <h4 className="font-bold text-lg">{engine.name}</h4>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black">{engine.score}</div>
        </div>
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed font-medium">
        {engine.rationale}
      </p>

      <div className="pt-3 border-t border-black/5 dark:border-white/5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Recommended Action</div>
        <div className="text-sm font-medium flex items-center gap-2 text-primary">
          <ArrowRight className="w-4 h-4" />
          {engine.next_action}
        </div>
      </div>
    </div>
  )
}

export function AuditResults({ result }: AuditResultsProps) {
  if (result.status === 'needs_more_data') {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="text-2xl font-bold">Assessment Incomplete</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We need a bit more data to generate a reliable strategic analysis. Please complete at least 70% of the assessment.
        </p>
        <div className="inline-block px-4 py-2 bg-secondary rounded-lg font-mono text-sm">
          Current Analysis Depth: <span className="font-bold">{Math.round(result.completion_score * 100)}%</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-4">
          <AIBadge confidence={Math.round(result.completion_score * 100)} label="DriverOS Strategy Engine" />
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold tracking-tight">Strategic Architecture Report</h2>
          <p className="text-xl text-muted-foreground">Generated for {result.company.industry} • {result.company.size_band} Employees</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
          <div className="p-4 rounded-xl bg-card border shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Business Gear</div>
            <div className="text-3xl font-black text-primary">{result.gear.number}</div>
            <div className="text-xs font-medium uppercase tracking-wider text-primary/80">{result.gear.label}</div>
          </div>
          <div className="p-4 rounded-xl bg-card border shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Data Index</div>
            <div className="text-3xl font-black text-foreground">{Math.round(result.completion_score * 100)}%</div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Confidence</div>
          </div>
          <div className="p-4 rounded-xl bg-card border shadow-sm col-span-2 flex flex-col justify-center">
            <div className="text-sm text-muted-foreground mb-1">Primary Focus</div>
            <div className="font-bold text-foreground leading-tight">{result.gear.reason}</div>
          </div>
        </div>
      </div>

      {/* Weekly Accelerator */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium uppercase tracking-widest opacity-90">Your Weekly Accelerator</div>
            <h3 className="text-3xl md:text-4xl font-black tracking-tight">{result.accelerator.kpi}</h3>
            <p className="text-lg opacity-90 max-w-2xl">{result.accelerator.notes}</p>
          </div>
        </div>
      </div>

      {/* Signal Board */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Core Engine Status
          </h3>
          <span className="text-sm text-muted-foreground">Live Analysis</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.engines.map((engine, index) => (
            <EngineCard key={index} engine={engine} />
          ))}
        </div>
      </div>

      {/* Risk Analysis (Brakes) */}
      {result.brakes.flags.length > 0 && (
        <div className="rounded-2xl border-2 border-yellow-500/20 bg-yellow-500/5 p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <ShieldAlert className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <h3 className="text-xl font-bold text-foreground">Risk Assessment: {result.brakes.risk_level.toUpperCase()}</h3>
                <p className="text-muted-foreground">Critical vulnerabilities detected in your business architecture.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-background/50 p-4 rounded-xl border border-yellow-500/10">
                  <strong className="block text-sm font-bold text-yellow-700 dark:text-yellow-300 mb-2 uppercase tracking-wider">Detected Risks</strong>
                  <ul className="space-y-2">
                    {result.brakes.flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-background/50 p-4 rounded-xl border border-yellow-500/10">
                  <strong className="block text-sm font-bold text-green-700 dark:text-green-300 mb-2 uppercase tracking-wider">Mitigation Controls</strong>
                  <ul className="space-y-2">
                    {result.brakes.controls.map((control, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        {control}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Plan */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            Immediate Priorities
          </h3>
          <div className="space-y-4">
            {result.actions.do_now.map((action, index) => (
              <div key={index} className="group p-5 bg-card hover:bg-accent/5 transition-colors border rounded-xl shadow-sm hover:shadow-md hover:border-primary/20">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-lg">{action.title}</div>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded uppercase">{action.eta_days} Days</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{action.why}</p>
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {action.owner_role}</span>
                  <span className="w-1 h-1 bg-border rounded-full" />
                  <span>{action.engine}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            30-Day Roadmap
          </h3>
          <div className="space-y-4">
            {result.actions.do_next.map((action, index) => (
              <div key={index} className="group p-5 bg-card hover:bg-accent/5 transition-colors border rounded-xl shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-lg">{action.title}</div>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded uppercase">{action.eta_days} Days</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{action.why}</p>
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {action.owner_role}</span>
                  <span className="w-1 h-1 bg-border rounded-full" />
                  <span>{action.engine}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="mt-12 p-8 bg-secondary/50 rounded-2xl border-2 border-dashed border-border text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl font-bold">Ready to Operationalize?</h3>
          <p className="text-muted-foreground">
            Transform this static report into a living, breathing dashboard that tracks your progress automatically.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
              Launch DriverOS Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
            <Download className="w-5 h-5 mr-2" />
            Export PDF Report
          </Button>
        </div>
      </div>
    </div>
  )
}
