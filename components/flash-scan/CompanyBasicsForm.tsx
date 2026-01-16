'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FlashScanData } from '@/lib/types'
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react'
import type { SubmitState } from '@/hooks/useFormSubmit'

interface CompanyBasicsFormProps {
  onSubmit: (data: FlashScanData) => void
  submitState?: SubmitState
  progress?: number
}

export function CompanyBasicsForm({ onSubmit, submitState = 'idle', progress = 0 }: CompanyBasicsFormProps) {
  const [formData, setFormData] = useState<FlashScanData>({
    industry: '',
    size_band: '',
    role: '',
    north_star: '',
    top_constraint: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateField = (field: keyof FlashScanData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isValid = Object.values(formData).every(value => value.trim() !== '')

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">DriverOS Flash Scan</h1>
        <p className="text-muted-foreground">Know your bottleneck, KPI, and next moves in under 5 minutes</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="industry" className="block text-sm font-medium mb-2">
            Industry
          </label>
          <Select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={(e) => updateField('industry', e.target.value)}
            required
            aria-required="true"
          >
            <option value="">Select industry...</option>
            <option value="Tech">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        <div>
          <label htmlFor="size-band" className="block text-sm font-medium mb-2">
            Company Size
          </label>
          <Select
            id="size-band"
            name="size_band"
            value={formData.size_band}
            onChange={(e) => updateField('size_band', e.target.value)}
            required
            aria-required="true"
          >
            <option value="">Select size...</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201+">201+ employees</option>
          </Select>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-2">
            Your Role
          </label>
          <Select
            id="role"
            name="role"
            value={formData.role}
            onChange={(e) => updateField('role', e.target.value)}
            required
            aria-required="true"
          >
            <option value="">Select role...</option>
            <option value="Owner">Owner</option>
            <option value="CEO">CEO</option>
            <option value="Leader">Leader</option>
            <option value="Ops">Operations</option>
            <option value="Sales">Sales</option>
            <option value="Finance">Finance</option>
          </Select>
        </div>

        <div>
          <label htmlFor="north-star" className="block text-sm font-medium mb-2">
            North Star Goal
          </label>
          <Input
            id="north-star"
            name="north_star"
            placeholder="e.g. Scale to $5M ARR and exit to private equity in 3 years"
            value={formData.north_star}
            onChange={(e) => updateField('north_star', e.target.value)}
            required
            aria-required="true"
            aria-describedby="north-star-hint"
          />
          <span id="north-star-hint" className="sr-only">
            Enter your primary business goal for the next 12-18 months
          </span>
        </div>

        <div>
          <label htmlFor="top-constraint" className="block text-sm font-medium mb-2">
            Biggest Constraint
          </label>
          <Input
            id="top-constraint"
            name="top_constraint"
            placeholder="e.g. CAC is too high to scale paid ads profitably"
            value={formData.top_constraint}
            onChange={(e) => updateField('top_constraint', e.target.value)}
            required
            aria-required="true"
            aria-describedby="constraint-hint"
          />
          <span id="constraint-hint" className="sr-only">
            What is currently holding your business back?
          </span>
        </div>
      </div>

      {/* Processing feedback */}
      {submitState === 'processing' && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Analyzing your bottleneck and next moves...</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Processing {Math.round(progress)}% complete
          </p>
        </div>
      )}

      {/* Success feedback */}
      {submitState === 'success' && (
        <div className="flex items-center justify-center gap-2 text-green-600 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">Analysis complete!</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!isValid || submitState === 'processing'}
      >
        {submitState === 'processing' ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : submitState === 'success' ? (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Complete
          </>
        ) : (
          'Get My Flash Scan'
        )}
      </Button>
    </form>
  )
}
