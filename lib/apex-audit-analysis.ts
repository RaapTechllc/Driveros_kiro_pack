// Apex Audit Analysis Engine

import { ApexAuditData, ApexAuditResult } from './apex-audit-types'

export function analyzeApexAudit(data: ApexAuditData): ApexAuditResult {
  // Calculate data completeness
  const fields = Object.values(data)
  const filledFields = fields.filter(v => v !== '' && v !== 0 && v !== undefined).length
  const dataCompleteness = Math.round((filledFields / fields.length) * 100)

  // Calculate unit economics
  const cacLtvRatio = data.customer_acquisition_cost > 0 
    ? data.customer_lifetime_value / data.customer_acquisition_cost 
    : 0
  
  const runwayMonths = data.monthly_burn > 0 
    ? Math.round(data.cash_on_hand / data.monthly_burn) 
    : 99

  // Determine business stage
  const stage = determineStage(data)
  
  // Calculate health score
  const healthScore = calculateHealthScore(data, cacLtvRatio, runwayMonths)
  
  // Identify primary bottleneck
  const primaryBottleneck = identifyBottleneck(data)
  
  // Generate growth opportunities
  const growthOpportunities = generateGrowthOpportunities(data)
  
  // Assess risks
  const risks = assessRisks(data, runwayMonths, cacLtvRatio)
  
  // Generate action plans
  const { immediate, shortTerm, mediumTerm } = generateActionPlan(data, primaryBottleneck)

  return {
    health_score: healthScore,
    stage,
    primary_bottleneck: primaryBottleneck,
    priority_90day: mediumTerm[0] || 'Focus on stabilizing current operations',
    unit_economics: {
      cac_ltv_ratio: Math.round(cacLtvRatio * 10) / 10,
      cac_ltv_assessment: assessCacLtv(cacLtvRatio),
      margin_opportunity: assessMargins(data.gross_margin, data.net_margin),
      runway_months: runwayMonths,
      runway_assessment: assessRunway(runwayMonths)
    },
    growth_opportunities: growthOpportunities,
    risks,
    immediate_actions: immediate,
    short_term_actions: shortTerm,
    medium_term_actions: mediumTerm,
    confidence_score: Math.min(95, 60 + dataCompleteness * 0.35),
    data_completeness: dataCompleteness
  }
}

function determineStage(data: ApexAuditData): ApexAuditResult['stage'] {
  const revenue = data.annual_revenue
  const employees = data.employee_count || 1
  const years = data.years_in_business

  if (revenue < 100000 || years < 2) return 'Startup'
  if (revenue < 1000000 || employees < 10) return 'Growth'
  if (revenue < 10000000 || employees < 50) return 'Scale'
  return 'Mature'
}

function calculateHealthScore(data: ApexAuditData, cacLtv: number, runway: number): number {
  let score = 50 // Base score

  // Revenue health (+/- 15)
  if (data.annual_revenue > 1000000) score += 15
  else if (data.annual_revenue > 500000) score += 10
  else if (data.annual_revenue > 100000) score += 5

  // Profitability (+/- 15)
  if (data.net_margin > 20) score += 15
  else if (data.net_margin > 10) score += 10
  else if (data.net_margin > 0) score += 5
  else score -= 10

  // CAC:LTV ratio (+/- 10)
  if (cacLtv >= 3) score += 10
  else if (cacLtv >= 2) score += 5
  else if (cacLtv < 1) score -= 10

  // Cash runway (+/- 10)
  if (runway >= 12) score += 10
  else if (runway >= 6) score += 5
  else if (runway < 3) score -= 10

  // Growth indicators (+/- 10)
  if (data.new_customers_monthly > 10) score += 5
  if (data.close_rate > 30) score += 5

  return Math.max(0, Math.min(100, score))
}

function identifyBottleneck(data: ApexAuditData): string {
  // Use their stated constraint first
  if (data.biggest_constraint) {
    return data.biggest_constraint
  }

  // Otherwise analyze the data
  const cacLtv = data.customer_lifetime_value / (data.customer_acquisition_cost || 1)
  
  if (data.monthly_leads < 50 && data.monthly_marketing_spend < 1000) {
    return 'Lead generation - not enough top-of-funnel activity'
  }
  if (data.close_rate < 20) {
    return 'Sales conversion - leads aren\'t converting to customers'
  }
  if (cacLtv < 2) {
    return 'Unit economics - customer value doesn\'t justify acquisition cost'
  }
  if (data.monthly_churn > 10) {
    return 'Retention - losing customers faster than acquiring them'
  }
  if (data.net_margin < 10) {
    return 'Profitability - revenue isn\'t translating to profit'
  }
  
  return 'Growth capacity - ready to scale but need systems'
}

function assessCacLtv(ratio: number): string {
  if (ratio >= 4) return 'Excellent - strong unit economics, scale aggressively'
  if (ratio >= 3) return 'Healthy - good foundation for growth'
  if (ratio >= 2) return 'Acceptable - room for optimization'
  if (ratio >= 1) return 'Warning - barely breaking even on customers'
  return 'Critical - losing money on each customer'
}

function assessMargins(gross: number, net: number): string {
  if (net > 25) return 'Strong margins - reinvest in growth'
  if (net > 15) return 'Healthy margins - optimize operations for more'
  if (net > 5) return 'Thin margins - focus on pricing or cost reduction'
  if (gross > 50 && net < 10) return 'High gross, low net - operational inefficiency'
  return 'Margin pressure - review pricing and costs urgently'
}

function assessRunway(months: number): string {
  if (months >= 18) return 'Strong position - 18+ months runway'
  if (months >= 12) return 'Comfortable - 12+ months runway'
  if (months >= 6) return 'Caution - 6-12 months, plan ahead'
  if (months >= 3) return 'Warning - 3-6 months, take action now'
  return 'Critical - less than 3 months, immediate attention needed'
}

function generateGrowthOpportunities(data: ApexAuditData): ApexAuditResult['growth_opportunities'] {
  const opportunities: ApexAuditResult['growth_opportunities'] = []

  // Lead generation opportunities
  if (data.lead_source === 'Referrals' && data.monthly_marketing_spend < 5000) {
    opportunities.push({
      area: 'Paid Acquisition',
      recommendation: 'Add paid search to diversify beyond referrals - start with $2-5K/month test',
      impact: 'High'
    })
  }

  // Pricing opportunities
  if (data.gross_margin > 60 && data.average_deal_size < 5000) {
    opportunities.push({
      area: 'Pricing',
      recommendation: 'Strong margins suggest room for premium pricing or upsells',
      impact: 'High'
    })
  }

  // Retention opportunities
  if (data.monthly_churn > 5 && data.customer_lifetime_value > 1000) {
    opportunities.push({
      area: 'Retention',
      recommendation: 'Reducing churn by 2% could add significant LTV - implement success program',
      impact: 'High'
    })
  }

  // Sales efficiency
  if (data.close_rate < 25 && data.sales_team_size > 2) {
    opportunities.push({
      area: 'Sales Process',
      recommendation: 'Below-average close rate - audit sales process and qualification criteria',
      impact: 'Medium'
    })
  }

  // Tech stack
  if (data.tech_status.includes('Minimal') || data.tech_status.includes('Basic')) {
    opportunities.push({
      area: 'Technology',
      recommendation: 'Invest in integrated tech stack to improve efficiency and data visibility',
      impact: 'Medium'
    })
  }

  // Default if none found
  if (opportunities.length === 0) {
    opportunities.push({
      area: 'Market Expansion',
      recommendation: 'Strong fundamentals - consider geographic or product expansion',
      impact: 'Medium'
    })
  }

  return opportunities.slice(0, 4)
}

function assessRisks(data: ApexAuditData, runway: number, cacLtv: number): ApexAuditResult['risks'] {
  const risks: ApexAuditResult['risks'] = []

  // Cash risk
  if (runway < 6) {
    risks.push({
      risk: 'Cash runway below 6 months',
      severity: runway < 3 ? 'Critical' : 'High',
      mitigation: 'Reduce burn, accelerate collections, or secure funding'
    })
  }

  // Concentration risk
  if (data.lead_source === 'Referrals' && data.advertising_mode === 'None yet') {
    risks.push({
      risk: 'Single channel dependency (referrals only)',
      severity: 'High',
      mitigation: 'Diversify lead sources - test paid acquisition or content marketing'
    })
  }

  // Unit economics risk
  if (cacLtv < 2) {
    risks.push({
      risk: 'Weak unit economics (CAC:LTV ratio)',
      severity: cacLtv < 1 ? 'Critical' : 'High',
      mitigation: 'Improve retention, increase prices, or reduce acquisition costs'
    })
  }

  // Churn risk
  if (data.monthly_churn > 8) {
    risks.push({
      risk: 'High customer churn rate',
      severity: data.monthly_churn > 15 ? 'Critical' : 'High',
      mitigation: 'Implement customer success program and exit interviews'
    })
  }

  // Key person risk (solo operator)
  if (data.employee_count <= 1) {
    risks.push({
      risk: 'Key person dependency',
      severity: 'Medium',
      mitigation: 'Document processes, consider first hire or contractors'
    })
  }

  return risks.slice(0, 4)
}

function generateActionPlan(data: ApexAuditData, bottleneck: string): {
  immediate: string[]
  shortTerm: string[]
  mediumTerm: string[]
} {
  const immediate: string[] = []
  const shortTerm: string[] = []
  const mediumTerm: string[] = []

  // Immediate actions based on bottleneck
  if (bottleneck.includes('Lead generation')) {
    immediate.push('List 10 potential referral partners to contact')
    immediate.push('Set up Google Business Profile if not done')
    shortTerm.push('Launch $1K test campaign on Google Ads')
    shortTerm.push('Create lead magnet for website')
    mediumTerm.push('Build systematic referral program with incentives')
  } else if (bottleneck.includes('Sales conversion')) {
    immediate.push('Review last 10 lost deals - identify patterns')
    immediate.push('Script the top 3 objection responses')
    shortTerm.push('Implement follow-up sequence (5 touches minimum)')
    shortTerm.push('Add case studies/testimonials to sales process')
    mediumTerm.push('Hire or train dedicated closer')
  } else if (bottleneck.includes('Unit economics')) {
    immediate.push('Analyze top 20% of customers - what makes them valuable?')
    immediate.push('Review pricing against competitors')
    shortTerm.push('Test 15-20% price increase on new customers')
    shortTerm.push('Create upsell/cross-sell offers')
    mediumTerm.push('Implement customer success to extend LTV')
  } else if (bottleneck.includes('Retention')) {
    immediate.push('Call 5 recently churned customers - understand why')
    immediate.push('Identify at-risk customers (low engagement)')
    shortTerm.push('Implement 30/60/90 day check-in process')
    shortTerm.push('Create loyalty program or annual discount')
    mediumTerm.push('Build customer health scoring system')
  } else {
    // Default growth-focused actions
    immediate.push('Document your top 3 processes')
    immediate.push('Identify one task to delegate or automate')
    shortTerm.push('Set up weekly KPI dashboard')
    shortTerm.push('Create 90-day goal with milestones')
    mediumTerm.push('Plan first strategic hire')
  }

  // Add universal actions
  if (data.tech_status.includes('Minimal')) {
    shortTerm.push('Implement basic CRM (HubSpot free tier)')
  }
  
  if (!data.value_proposition) {
    immediate.push('Write one-sentence value proposition')
  }

  return {
    immediate: immediate.slice(0, 3),
    shortTerm: shortTerm.slice(0, 5),
    mediumTerm: mediumTerm.slice(0, 3)
  }
}
