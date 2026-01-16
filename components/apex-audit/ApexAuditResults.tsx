'use client'

import { ApexAuditResult } from '@/lib/apex-audit-types'
import { Button } from '@/components/ui/Button'
import { 
  TrendingUp, AlertTriangle, CheckCircle2, Target, 
  DollarSign, Users, Zap, ArrowRight, Download
} from 'lucide-react'

interface ApexAuditResultsProps {
  result: ApexAuditResult
  onViewDashboard: () => void
}

export function ApexAuditResults({ result, onViewDashboard }: ApexAuditResultsProps) {
  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-green-500/20 text-green-400'
      case 'Medium': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-card border-2 border-border">
          <div className="text-sm text-muted-foreground mb-2">Health Score</div>
          <div className={`text-5xl font-bold ${getHealthColor(result.health_score)}`}>
            {result.health_score}
          </div>
          <div className="text-sm text-muted-foreground mt-1">out of 100</div>
        </div>

        <div className="p-6 rounded-2xl bg-card border-2 border-border">
          <div className="text-sm text-muted-foreground mb-2">Business Stage</div>
          <div className="text-3xl font-bold text-foreground">{result.stage}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {result.stage === 'Startup' && 'Finding product-market fit'}
            {result.stage === 'Growth' && 'Scaling what works'}
            {result.stage === 'Scale' && 'Building systems'}
            {result.stage === 'Mature' && 'Optimizing efficiency'}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border-2 border-border">
          <div className="text-sm text-muted-foreground mb-2">CAC:LTV Ratio</div>
          <div className={`text-3xl font-bold ${result.unit_economics.cac_ltv_ratio >= 3 ? 'text-green-500' : result.unit_economics.cac_ltv_ratio >= 2 ? 'text-yellow-500' : 'text-red-500'}`}>
            {result.unit_economics.cac_ltv_ratio}:1
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {result.unit_economics.cac_ltv_ratio >= 3 ? 'Healthy' : 'Needs work'}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border-2 border-border">
          <div className="text-sm text-muted-foreground mb-2">Confidence</div>
          <div className="text-3xl font-bold text-primary">{Math.round(result.confidence_score)}%</div>
          <div className="text-sm text-muted-foreground mt-1">
            {result.data_completeness}% data provided
          </div>
        </div>
      </div>

      {/* Primary Bottleneck */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-2 border-primary/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Primary Bottleneck</h3>
            <p className="text-foreground">{result.primary_bottleneck}</p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>90-Day Priority:</strong> {result.priority_90day}
            </p>
          </div>
        </div>
      </div>

      {/* Unit Economics */}
      <div className="p-6 rounded-2xl bg-card border-2 border-border">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Unit Economics Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="text-sm text-muted-foreground">CAC:LTV Assessment</div>
            <div className="text-foreground mt-1">{result.unit_economics.cac_ltv_assessment}</div>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="text-sm text-muted-foreground">Margin Opportunity</div>
            <div className="text-foreground mt-1">{result.unit_economics.margin_opportunity}</div>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="text-sm text-muted-foreground">Cash Runway</div>
            <div className="text-foreground mt-1">
              {result.unit_economics.runway_months} months - {result.unit_economics.runway_assessment}
            </div>
          </div>
        </div>
      </div>

      {/* Growth Opportunities */}
      <div className="p-6 rounded-2xl bg-card border-2 border-border">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Growth Opportunities
        </h3>
        <div className="space-y-3">
          {result.growth_opportunities.map((opp, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(opp.impact)}`}>
                {opp.impact}
              </span>
              <div>
                <div className="font-medium text-foreground">{opp.area}</div>
                <div className="text-sm text-muted-foreground">{opp.recommendation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      {result.risks.length > 0 && (
        <div className="p-6 rounded-2xl bg-card border-2 border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Risk Assessment
          </h3>
          <div className="space-y-3">
            {result.risks.map((risk, i) => (
              <div key={i} className={`p-4 rounded-xl border ${getSeverityColor(risk.severity)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase">{risk.severity}</span>
                  <span className="font-medium">{risk.risk}</span>
                </div>
                <div className="text-sm opacity-80">
                  <strong>Mitigation:</strong> {risk.mitigation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Plan */}
      <div className="p-6 rounded-2xl bg-card border-2 border-border">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Action Plan
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Immediate */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold">!</span>
              This Week
            </h4>
            <ul className="space-y-2">
              {result.immediate_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Short Term */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs font-bold">30</span>
              Next 30 Days
            </h4>
            <ul className="space-y-2">
              {result.short_term_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Medium Term */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">90</span>
              90-Day Initiatives
            </h4>
            <ul className="space-y-2">
              {result.medium_term_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button variant="shimmer" size="lg" onClick={onViewDashboard}>
          View Full Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button variant="outline" size="lg">
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  )
}
