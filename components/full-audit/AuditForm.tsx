'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { FullAuditData } from '@/lib/full-audit-analysis'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface AuditFormProps {
  initialData?: Partial<FullAuditData>
  onSubmit: (data: FullAuditData) => void
}

// Engine descriptions and guidance
const ENGINE_GUIDANCE = {
  leadership: {
    title: "Leadership Engine",
    description: "How well does your leadership team set direction, make decisions, and keep everyone aligned? Strong leadership creates clarity and momentum.",
    icon: "🎯",
    questions: {
      vision_clarity: {
        label: "Vision Clarity",
        help: "Can your team clearly articulate where the company is headed and why?",
        scale: [
          "No clear vision; team is confused about direction",
          "Vision exists but isn't well communicated",
          "Vision is documented; some team members understand it",
          "Vision is clear; most team members can articulate it",
          "Crystal clear vision that drives daily decisions"
        ]
      },
      decision_speed: {
        label: "Decision Speed",
        help: "How quickly can your leadership team make important decisions?",
        scale: [
          "Decisions take weeks/months; constant delays",
          "Major decisions often stall or get revisited",
          "Decisions made in reasonable time, some delays",
          "Most decisions made quickly with clear ownership",
          "Rapid, confident decisions with clear accountability"
        ]
      },
      team_alignment: {
        label: "Team Alignment",
        help: "Is everyone rowing in the same direction on priorities and goals?",
        scale: [
          "Departments work in silos; conflicting priorities",
          "Some alignment, but frequent miscommunication",
          "Generally aligned; occasional conflicts",
          "Strong alignment; team collaborates well",
          "Fully aligned; team acts as one unit"
        ]
      }
    }
  },
  operations: {
    title: "Operations Engine",
    description: "How efficiently does work flow through your organization? Great operations mean predictable delivery and happy customers.",
    icon: "⚙️",
    questions: {
      process_efficiency: {
        label: "Process Efficiency",
        help: "How streamlined are your core workflows? Are there bottlenecks or wasted effort?",
        scale: [
          "Chaotic; no standard processes",
          "Some processes exist but often bypassed",
          "Processes work but have inefficiencies",
          "Efficient processes with continuous improvement",
          "Highly optimized; lean operations"
        ]
      },
      quality_control: {
        label: "Quality Control",
        help: "How consistent is the quality of your product/service delivery?",
        scale: [
          "Frequent quality issues; customer complaints",
          "Quality varies; reactive fixes",
          "Generally consistent with occasional issues",
          "High quality with proactive checks",
          "Exceptional quality; rarely any issues"
        ]
      },
      delivery_reliability: {
        label: "Delivery Reliability",
        help: "Do you deliver on time, every time? Can customers count on your commitments?",
        scale: [
          "Frequently miss deadlines; unreliable",
          "Often late; customers frustrated",
          "Usually on time; some delays",
          "Reliable delivery; rarely late",
          "Always on time; exceeds expectations"
        ]
      }
    }
  },
  marketing_sales: {
    title: "Marketing & Sales Engine",
    description: "How well do you attract, convert, and retain customers? This engine drives revenue growth and market position.",
    icon: "📈",
    questions: {
      lead_generation: {
        label: "Lead Generation",
        help: "Are you generating enough qualified leads to hit your growth targets?",
        scale: [
          "Very few leads; struggling to find prospects",
          "Some leads but not enough to grow",
          "Adequate leads; could be better",
          "Strong lead flow; good pipeline",
          "Abundant qualified leads; more than capacity"
        ]
      },
      conversion_rate: {
        label: "Conversion Rate",
        help: "What percentage of leads become paying customers?",
        scale: [
          "Very low conversion; most leads don't buy",
          "Below industry average conversion",
          "Average conversion rate",
          "Above average; good close rate",
          "Excellent conversion; high close rate"
        ]
      },
      customer_retention: {
        label: "Customer Retention",
        help: "Do customers stay and buy again? What's your churn like?",
        scale: [
          "High churn; customers leave quickly",
          "Moderate churn; losing too many customers",
          "Average retention; some repeat business",
          "Good retention; loyal customer base",
          "Excellent retention; customers are advocates"
        ]
      }
    }
  },
  finance: {
    title: "Finance Engine",
    description: "How healthy are your financials? Cash flow, profitability, and planning determine your runway and growth capacity.",
    icon: "💰",
    questions: {
      cash_flow_health: {
        label: "Cash Flow Health",
        help: "Do you have enough cash to cover expenses and invest in growth?",
        scale: [
          "Constant cash crunch; struggling to pay bills",
          "Tight cash flow; frequent stress",
          "Cash flow is manageable but unpredictable",
          "Healthy cash position; some buffer",
          "Strong cash reserves; well-funded"
        ]
      },
      profitability: {
        label: "Profitability",
        help: "Are you making money? What are your margins like?",
        scale: [
          "Operating at a loss; burning cash",
          "Barely breaking even",
          "Modest profits; thin margins",
          "Good profitability; healthy margins",
          "Highly profitable; strong margins"
        ]
      },
      financial_planning: {
        label: "Financial Planning",
        help: "Do you have budgets, forecasts, and financial controls in place?",
        scale: [
          "No financial planning; flying blind",
          "Basic tracking but no real planning",
          "Have budgets; not always followed",
          "Regular forecasting and budget reviews",
          "Sophisticated planning with scenario modeling"
        ]
      }
    }
  },
  personnel: {
    title: "Personnel Engine",
    description: "How strong is your team? Engaged, skilled people are your greatest asset and competitive advantage.",
    icon: "👥",
    questions: {
      team_satisfaction: {
        label: "Team Satisfaction",
        help: "How happy and engaged are your employees?",
        scale: [
          "Low morale; frequent complaints",
          "Some dissatisfaction; disengagement",
          "Average satisfaction; neither happy nor unhappy",
          "Team is generally happy and motivated",
          "Highly engaged; team loves working here"
        ]
      },
      skill_gaps: {
        label: "Skill Gaps",
        help: "Does your team have the skills needed to execute? (1 = many gaps, 5 = no gaps)",
        scale: [
          "Major skill gaps; can't execute strategy",
          "Significant gaps; struggling in key areas",
          "Some gaps; manageable with effort",
          "Minor gaps; mostly covered",
          "Full capability; team has all needed skills"
        ]
      },
      retention_risk: {
        label: "Retention Risk",
        help: "How likely are key people to leave? (1 = low risk, 5 = high risk)",
        scale: [
          "Very low risk; team is committed",
          "Low risk; most are stable",
          "Moderate risk; some might leave",
          "High risk; key people considering leaving",
          "Critical risk; expecting departures"
        ],
        inverted: true
      }
    }
  }
}

export function AuditForm({ initialData, onSubmit }: AuditFormProps) {
  const [formData, setFormData] = useState<FullAuditData>({
    // Flash Scan data (pre-filled from upgrade)
    industry: initialData?.industry || '',
    size_band: initialData?.size_band || '',
    role: initialData?.role || '',
    north_star: initialData?.north_star || '',
    top_constraint: initialData?.top_constraint || '',

    // Leadership Engine
    vision_clarity: 0,
    decision_speed: 0,
    team_alignment: 0,

    // Operations Engine
    process_efficiency: 0,
    quality_control: 0,
    delivery_reliability: 0,

    // Marketing & Sales Engine
    lead_generation: 0,
    conversion_rate: 0,
    customer_retention: 0,

    // Finance Engine
    cash_flow_health: 0,
    profitability: 0,
    financial_planning: 0,

    // Personnel Engine
    team_satisfaction: 0,
    skill_gaps: 0,
    retention_risk: 0
  })

  const [expandedHelp, setExpandedHelp] = useState<string | null>(null)

  const updateField = (field: keyof FullAuditData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const toggleHelp = (field: string) => {
    setExpandedHelp(expandedHelp === field ? null : field)
  }

  interface QuestionConfig {
    label: string
    help: string
    scale: string[]
    inverted?: boolean
  }

  const RatingInput = ({
    field,
    config
  }: {
    field: keyof FullAuditData
    config: QuestionConfig
  }) => {
    const currentValue = formData[field] as number

    return (
      <div className="space-y-3" data-testid={`rating-${field}`}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{config.label}</label>
          <button
            type="button"
            onClick={() => toggleHelp(field)}
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <HelpCircle className="h-3 w-3" />
            {expandedHelp === field ? 'Hide guide' : 'Show guide'}
          </button>
        </div>

        <p className="text-xs text-muted-foreground">{config.help}</p>

        <div className="grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map((rating) => {
            const isSelected = currentValue === rating
            return (
              <button
                key={rating}
                type="button"
                onClick={() => updateField(field, rating)}
                className={`
                  group relative flex flex-col items-center justify-center p-2 rounded-lg border text-sm transition-all
                  ${isSelected
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted'
                  }
                `}
              >
                <span className="text-lg mb-1">{rating}</span>
                {/* Tooltip-like description on hover or selection */}
                <div className={`
                  absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded bg-popover text-popover-foreground text-xs text-center shadow-md z-50 pointer-events-none opacity-0 transition-opacity
                  ${isSelected ? 'opacity-0' : 'group-hover:opacity-100'} 
                `}>
                  {config.scale[rating - 1]}
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Description Display */}
        {currentValue > 0 && (
          <div className="text-xs p-2 rounded bg-primary/5 border border-primary/10 text-foreground animate-in fade-in slide-in-from-top-1">
            <span className="font-semibold text-primary">{currentValue}/5:</span> {config.scale[currentValue - 1]}
          </div>
        )}

        {/* Expanded Guide */}
        {expandedHelp === field && (
          <div className="mt-2 p-3 bg-muted/50 rounded-lg text-xs space-y-2 animate-slide-in">
            <p className="font-medium">Rating Guide:</p>
            {config.scale.map((desc, idx) => (
              <div
                key={idx}
                className={`flex gap-3 p-1.5 rounded ${currentValue === idx + 1 ? 'bg-background shadow-sm border border-border' : ''}`}
              >
                <span className={`font-mono font-bold ${currentValue === idx + 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {idx + 1}
                </span>
                <span className={currentValue === idx + 1 ? 'text-foreground' : 'text-muted-foreground'}>
                  {desc}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const auditFields = Object.values(formData).filter(v => typeof v === 'number' && v > 0).length
  const totalAuditFields = 15 // 5 engines × 3 questions each
  const completionPercent = Math.round((auditFields / totalAuditFields) * 100)

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Full Audit</h1>
        <p className="text-muted-foreground mb-4">Complete analysis across 5 business engines</p>
        <div className="bg-secondary p-3 rounded-lg">
          <div className="text-sm text-muted-foreground">Progress: {completionPercent}%</div>
          <div className="w-full bg-background rounded-full h-2 mt-1">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Leadership Engine */}
      <div className="space-y-4 p-6 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{ENGINE_GUIDANCE.leadership.icon}</span>
          <h3 className="text-lg font-semibold text-primary">{ENGINE_GUIDANCE.leadership.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{ENGINE_GUIDANCE.leadership.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RatingInput field="vision_clarity" config={ENGINE_GUIDANCE.leadership.questions.vision_clarity} />
          <RatingInput field="decision_speed" config={ENGINE_GUIDANCE.leadership.questions.decision_speed} />
          <RatingInput field="team_alignment" config={ENGINE_GUIDANCE.leadership.questions.team_alignment} />
        </div>
      </div>

      {/* Operations Engine */}
      <div className="space-y-4 p-6 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{ENGINE_GUIDANCE.operations.icon}</span>
          <h3 className="text-lg font-semibold text-primary">{ENGINE_GUIDANCE.operations.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{ENGINE_GUIDANCE.operations.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RatingInput field="process_efficiency" config={ENGINE_GUIDANCE.operations.questions.process_efficiency} />
          <RatingInput field="quality_control" config={ENGINE_GUIDANCE.operations.questions.quality_control} />
          <RatingInput field="delivery_reliability" config={ENGINE_GUIDANCE.operations.questions.delivery_reliability} />
        </div>
      </div>

      {/* Marketing & Sales Engine */}
      <div className="space-y-4 p-6 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{ENGINE_GUIDANCE.marketing_sales.icon}</span>
          <h3 className="text-lg font-semibold text-primary">{ENGINE_GUIDANCE.marketing_sales.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{ENGINE_GUIDANCE.marketing_sales.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RatingInput field="lead_generation" config={ENGINE_GUIDANCE.marketing_sales.questions.lead_generation} />
          <RatingInput field="conversion_rate" config={ENGINE_GUIDANCE.marketing_sales.questions.conversion_rate} />
          <RatingInput field="customer_retention" config={ENGINE_GUIDANCE.marketing_sales.questions.customer_retention} />
        </div>
      </div>

      {/* Finance Engine */}
      <div className="space-y-4 p-6 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{ENGINE_GUIDANCE.finance.icon}</span>
          <h3 className="text-lg font-semibold text-primary">{ENGINE_GUIDANCE.finance.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{ENGINE_GUIDANCE.finance.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RatingInput field="cash_flow_health" config={ENGINE_GUIDANCE.finance.questions.cash_flow_health} />
          <RatingInput field="profitability" config={ENGINE_GUIDANCE.finance.questions.profitability} />
          <RatingInput field="financial_planning" config={ENGINE_GUIDANCE.finance.questions.financial_planning} />
        </div>
      </div>

      {/* Personnel Engine */}
      <div className="space-y-4 p-6 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{ENGINE_GUIDANCE.personnel.icon}</span>
          <h3 className="text-lg font-semibold text-primary">{ENGINE_GUIDANCE.personnel.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{ENGINE_GUIDANCE.personnel.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RatingInput field="team_satisfaction" config={ENGINE_GUIDANCE.personnel.questions.team_satisfaction} />
          <RatingInput field="skill_gaps" config={ENGINE_GUIDANCE.personnel.questions.skill_gaps} />
          <RatingInput field="retention_risk" config={ENGINE_GUIDANCE.personnel.questions.retention_risk} />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={completionPercent < 70}
      >
        {completionPercent < 70
          ? `Complete Assessment (${completionPercent}% done)`
          : 'Generate Full Analysis'
        }
      </Button>
    </form>
  )
}
