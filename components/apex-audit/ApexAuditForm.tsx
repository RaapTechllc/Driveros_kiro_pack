'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ApexAuditData, APEX_OPTIONS, APEX_DEFAULTS } from '@/lib/apex-audit-types'
import { ChevronLeft, ChevronRight, Building2, DollarSign, Users, TrendingUp, Settings, Target, Cpu, FileText, Shield, Palette, FlaskConical, Gift } from 'lucide-react'

interface ApexAuditFormProps {
  onSubmit: (data: ApexAuditData) => void
}

const SECTIONS = [
  { id: 'company', title: 'Company Profile', icon: Building2 },
  { id: 'revenue', title: 'Revenue & Profit', icon: DollarSign },
  { id: 'sales', title: 'Sales & Marketing', icon: TrendingUp },
  { id: 'customers', title: 'Customers', icon: Users },
  { id: 'operations', title: 'Operations', icon: Settings },
  { id: 'growth', title: 'Growth Planning', icon: Target },
  { id: 'tech', title: 'Tech Stack', icon: Cpu },
  { id: 'offer', title: 'Offer & Value', icon: Gift },
  { id: 'compliance', title: 'Compliance', icon: Shield },
  { id: 'brand', title: 'Brand', icon: Palette },
  { id: 'experiments', title: 'Experiments', icon: FlaskConical },
  { id: 'context', title: 'Additional Context', icon: FileText },
]

export function ApexAuditForm({ onSubmit }: ApexAuditFormProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Partial<ApexAuditData>>({
    ...APEX_DEFAULTS,
    tech_marketing: []
  })

  const updateField = (field: keyof ApexAuditData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => setStep(s => Math.min(s + 1, SECTIONS.length - 1))
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  const handleSubmit = () => {
    onSubmit(data as ApexAuditData)
  }

  const renderSelect = (field: keyof ApexAuditData, options: string[], label: string) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <select
        value={(data[field] as string) || ''}
        onChange={e => updateField(field, e.target.value)}
        className="w-full h-11 px-3 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )

  const renderNumber = (field: keyof ApexAuditData, label: string, placeholder?: string, prefix?: string) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{prefix}</span>}
        <Input
          type="number"
          value={(data[field] as number) || ''}
          onChange={e => updateField(field, parseFloat(e.target.value) || 0)}
          placeholder={placeholder}
          className={prefix ? 'pl-7' : ''}
        />
      </div>
    </div>
  )

  const renderText = (field: keyof ApexAuditData, label: string, placeholder?: string) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Input
        value={(data[field] as string) || ''}
        onChange={e => updateField(field, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )

  const renderTextarea = (field: keyof ApexAuditData, label: string, placeholder?: string) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <textarea
        value={(data[field] as string) || ''}
        onChange={e => updateField(field, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none resize-none"
      />
    </div>
  )

  const renderSlider = (field: keyof ApexAuditData, label: string, min: number, max: number, suffix?: string) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}: <span className="text-primary">{data[field] || 0}{suffix}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={(data[field] as number) || 0}
        onChange={e => updateField(field, parseInt(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  )

  const renderSection = () => {
    switch (step) {
      case 0: // Company Profile
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderText('company_name', 'Company Name', 'Acme Corp')}
            {renderText('website', 'Website', 'www.example.com')}
            {renderSelect('industry', APEX_OPTIONS.industry, 'Industry')}
            {renderSelect('employees', APEX_OPTIONS.employees, 'Team Size')}
            {renderNumber('years_in_business', 'Years in Business')}
            {renderSelect('legal_entity', APEX_OPTIONS.legal_entity, 'Legal Entity')}
            {renderSelect('geography', APEX_OPTIONS.geography, 'Geography Focus')}
            <div className="md:col-span-2">
              {renderTextarea('primary_product', 'Primary Product/Service', 'Describe what you sell...')}
            </div>
          </div>
        )

      case 1: // Revenue & Profit
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderNumber('annual_revenue', 'Annual Revenue', '500000', '$')}
            {renderNumber('yearly_profit', 'Yearly Profit', '100000', '$')}
            {renderNumber('monthly_revenue', 'Monthly Revenue', '40000', '$')}
            {renderSlider('gross_margin', 'Gross Margin', 0, 100, '%')}
            {renderSlider('net_margin', 'Net Margin', 0, 100, '%')}
            {renderNumber('cash_on_hand', 'Cash on Hand', '50000', '$')}
            {renderNumber('monthly_burn', 'Monthly Burn Rate', '10000', '$')}
          </div>
        )

      case 2: // Sales & Marketing
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelect('selling_mechanism', APEX_OPTIONS.selling_mechanism, 'Primary Selling Mechanism')}
              {renderSelect('advertising_mode', APEX_OPTIONS.advertising_mode, 'Primary Advertising')}
              {renderSelect('lead_source', APEX_OPTIONS.lead_source, 'Primary Lead Source')}
              {renderNumber('average_deal_size', 'Average Deal Size', '5000', '$')}
              {renderNumber('sales_cycle_days', 'Sales Cycle (days)', '30')}
              {renderSlider('close_rate', 'Close Rate', 0, 100, '%')}
              {renderNumber('monthly_marketing_spend', 'Monthly Marketing Spend', '5000', '$')}
              {renderNumber('monthly_leads', 'Monthly Leads', '100')}
              {renderNumber('sales_team_size', 'Sales Team Size', '1')}
              {renderNumber('pipeline_value', 'Total Pipeline Value', '100000', '$')}
              {renderNumber('new_customers_monthly', 'Monthly New Customers', '10')}
              {renderNumber('conversion_rate', 'Conversion Rate', '2', '%')}
              {renderNumber('website_checkout_rate', 'Website to Checkout Rate', '3', '%')}
              {renderNumber('cart_abandonment_rate', 'Cart Abandonment Rate', '60', '%')}
              {renderNumber('lead_to_customer_rate', 'Lead to Customer Rate', '15', '%')}
            </div>
            {renderTextarea('marketing_channels', 'Marketing Channels')}
            {renderTextarea('messaging_angles', 'Messaging Angles')}
            {renderTextarea('creatives', 'Creatives')}
            {renderTextarea('follow_up_sla', 'Follow-up SLA')}
          </div>
        )

      case 3: // Customers
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderNumber('total_customers', 'Total Customers', '100')}
            {renderNumber('new_customers_monthly', 'New Customers/Month', '10')}
            {renderNumber('customer_acquisition_cost', 'Customer Acquisition Cost', '500', '$')}
            {renderNumber('customer_lifetime_value', 'Customer Lifetime Value', '2000', '$')}
            {renderSlider('monthly_churn', 'Monthly Churn Rate', 0, 30, '%')}
            {renderSlider('nps_score', 'NPS Score', -100, 100, '')}
            {renderNumber('average_order_value', 'Average Order Value', '200', '$')}
            <div className="md:col-span-2 space-y-4 pt-4 border-t border-border">
              {renderTextarea('icp', 'Ideal Customer Profile (ICP)')}
              {renderTextarea('customer_segments', 'Customer Segments')}
              {renderTextarea('primary_pain_points', 'Primary Pain Points')}
              {renderTextarea('top_decision_drivers', 'Top Decision Drivers')}
            </div>
          </div>
        )

      case 4: // Operations
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelect('delivery_type', APEX_OPTIONS.delivery_type, 'Primary Delivery Type')}
              {renderSelect('tech_status', APEX_OPTIONS.tech_status, 'Current Tech Status')}
              {renderSelect('biggest_constraint', APEX_OPTIONS.constraint, 'Biggest Growth Constraint')}
              {renderText('operations_capacity', 'Operations Capacity')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderText('customer_acquisition', 'Customer Acquisition Process')}
              {renderText('customer_onboarding', 'Customer Onboarding Process')}
            </div>

            {renderTextarea('team_structure', 'Team Structure', 'Describe your team roles...')}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderText('primary_business_processes', 'Primary Business Processes')}
              {renderText('secondary_business_processes', 'Secondary Business Processes')}
              {renderText('data_analytics', 'Data & Analytics Setup')}
              {renderText('hr_recruiting', 'HR & Recruiting')}
              {renderText('admin_operations', 'Admin & Operations')}
              {renderText('quality_metrics', 'Quality Metrics')}
              {renderText('vendor_dependencies', 'Vendor Dependencies')}
              {renderText('procurement_lead_times', 'Procurement Lead Times')}
              {renderText('scheduling_rules', 'Scheduling Rules')}
              {renderText('workflow_stages', 'Workflow Stages')}
            </div>
            {renderTextarea('product_service_delivery', 'Product/Service Delivery Details')}
          </div>
        )

      case 5: // Growth Planning
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderNumber('revenue_goal_12mo', '12-Month Revenue Goal', '1000000', '$')}
            {renderSelect('growth_channel', APEX_OPTIONS.growth_channel, 'Main Growth Channel')}
            {renderSelect('exit_timeline', APEX_OPTIONS.exit_timeline, 'Exit Timeline')}
            {renderNumber('exit_target', 'Exit Target Amount', '5000000', '$')}
            {renderNumber('funding_needed', 'Funding Needed', '0', '$')}
            <div className="md:col-span-2">
              {renderTextarea('growth_strategy', 'Growth Strategy')}
              {renderTextarea('growth_constraints', 'Growth Constraints')}
            </div>
          </div>
        )

      case 6: // Tech Stack
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSelect('tech_crm', APEX_OPTIONS.crm, 'CRM')}
            {renderSelect('tech_accounting', APEX_OPTIONS.accounting, 'Accounting Software')}
            {renderSelect('tech_analytics', APEX_OPTIONS.analytics, 'Analytics')}
            {renderText('tech_communication', 'Communication Tools', 'Slack, Teams, etc.')}
            {renderText('common_tools', 'Common Tools/Stack')}
            {renderText('tech_other', 'Other Platforms')}

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground">Marketing Tools (select all that apply)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Google Ads', 'Meta Ads', 'Email Marketing', 'SEO Tools', 'Social Scheduling'].map(tool => (
                  <label key={tool} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(data.tech_marketing || []).includes(tool)}
                      onChange={e => {
                        const current = data.tech_marketing || []
                        if (e.target.checked) {
                          updateField('tech_marketing', [...current, tool])
                        } else {
                          updateField('tech_marketing', current.filter(t => t !== tool))
                        }
                      }}
                      className="accent-primary"
                    />
                    <span className="text-sm">{tool}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 7: // Offer & Value
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              {renderTextarea('value_proposition', 'Value Proposition', 'What makes you different? Why do customers choose you?')}
            </div>
            <div className="md:col-span-2">
              {renderTextarea('differentiators', 'Key Differentiators', 'What do you do better than competitors?')}
            </div>
            {renderTextarea('proof_assets', 'Proof Assets', 'Case studies, testimonials, etc.')}
            {renderTextarea('guarantees', 'Guarantees', 'Risk reversal offers')}
            {renderTextarea('promotions', 'Current Promotions')}
            {renderTextarea('offer_packages', 'Offer Packages', 'Tiers, bundles, etc.')}
          </div>
        )

      case 8: // Compliance
        return (
          <div className="space-y-4">
            {renderText('licenses', 'Licenses Held')}
            {renderTextarea('ad_restrictions', 'Advertising Restrictions')}
            {renderText('utility_territories', 'Utility Territories')}
            {renderText('permitting_jurisdictions', 'Permitting Jurisdictions')}
          </div>
        )

      case 9: // Brand
        return (
          <div className="space-y-4">
            {renderTextarea('brand_voice', 'Brand Voice', 'Professional, playful, authoritative, etc.')}
            {renderTextarea('prohibited_terms', 'Prohibited Terms', 'Words to avoid')}
            {renderTextarea('trust_signals', 'Trust Signals', 'Associations, awards, certifications')}
          </div>
        )

      case 10: // Experiments
        return (
          <div className="space-y-4">
            {renderTextarea('experiment_history', 'Experiment History', 'Past marketing or operational tests')}
          </div>
        )

      case 11: // Additional Context
        return (
          <div className="space-y-4">
            {renderTextarea('top_objections', 'Top Customer Objections', 'What concerns do prospects raise?')}
            {renderTextarea('whats_working', "What's Working Well", 'What aspects of your business are thriving?')}
            {renderTextarea('biggest_challenges', 'Biggest Challenges', 'What keeps you up at night?')}
            {renderTextarea('competitors', 'Competitors', 'Who are you up against?')}
          </div>
        )

      default:
        return null
    }
  }

  const currentSection = SECTIONS[step]
  const Icon = currentSection.icon

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {SECTIONS.map((section, i) => {
          const SectionIcon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${i === step
                ? 'bg-primary text-white'
                : i < step
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
                }`}
            >
              <SectionIcon className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{section.title}</span>
              <span className="text-sm font-medium sm:hidden">{i + 1}</span>
            </button>
          )
        })}
      </div>

      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="p-3 rounded-xl bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{currentSection.title}</h2>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {SECTIONS.length}</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="min-h-[300px]">
        {renderSection()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {step < SECTIONS.length - 1 ? (
          <Button onClick={nextStep}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button variant="shimmer" onClick={handleSubmit}>
            Generate Apex Analysis
          </Button>
        )}
      </div>
    </div>
  )
}
