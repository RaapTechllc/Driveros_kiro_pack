'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { FullAuditData } from '@/lib/full-audit-analysis'

interface AuditFormProps {
  initialData?: Partial<FullAuditData>
  onSubmit: (data: FullAuditData) => void
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

  const updateField = (field: keyof FullAuditData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const ScaleSelect = ({ field, label }: { field: keyof FullAuditData, label: string }) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <Select
        name={field}
        value={formData[field]?.toString() || '0'}
        onChange={(e) => updateField(field, parseInt(e.target.value))}
      >
        <option value="0">Select rating...</option>
        <option value="1">1 - Poor</option>
        <option value="2">2 - Below Average</option>
        <option value="3">3 - Average</option>
        <option value="4">4 - Good</option>
        <option value="5">5 - Excellent</option>
      </Select>
    </div>
  )

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
        <h3 className="text-lg font-semibold text-primary">Leadership Engine</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScaleSelect field="vision_clarity" label="Vision Clarity" />
          <ScaleSelect field="decision_speed" label="Decision Speed" />
          <ScaleSelect field="team_alignment" label="Team Alignment" />
        </div>
      </div>

      {/* Operations Engine */}
      <div className="space-y-4 p-6 border rounded-lg">
        <h3 className="text-lg font-semibold text-primary">Operations Engine</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScaleSelect field="process_efficiency" label="Process Efficiency" />
          <ScaleSelect field="quality_control" label="Quality Control" />
          <ScaleSelect field="delivery_reliability" label="Delivery Reliability" />
        </div>
      </div>

      {/* Marketing & Sales Engine */}
      <div className="space-y-4 p-6 border rounded-lg">
        <h3 className="text-lg font-semibold text-primary">Marketing & Sales Engine</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScaleSelect field="lead_generation" label="Lead Generation" />
          <ScaleSelect field="conversion_rate" label="Conversion Rate" />
          <ScaleSelect field="customer_retention" label="Customer Retention" />
        </div>
      </div>

      {/* Finance Engine */}
      <div className="space-y-4 p-6 border rounded-lg">
        <h3 className="text-lg font-semibold text-primary">Finance Engine</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScaleSelect field="cash_flow_health" label="Cash Flow Health" />
          <ScaleSelect field="profitability" label="Profitability" />
          <ScaleSelect field="financial_planning" label="Financial Planning" />
        </div>
      </div>

      {/* Personnel Engine */}
      <div className="space-y-4 p-6 border rounded-lg">
        <h3 className="text-lg font-semibold text-primary">Personnel Engine</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScaleSelect field="team_satisfaction" label="Team Satisfaction" />
          <ScaleSelect field="skill_gaps" label="Skill Gaps (1=many, 5=none)" />
          <ScaleSelect field="retention_risk" label="Retention Risk (1=low, 5=high)" />
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
