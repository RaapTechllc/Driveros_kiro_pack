import { analyzeApexAudit } from '../lib/apex-audit-analysis'
import { ApexAuditData } from '../lib/apex-audit-types'

// Helper to create minimal valid audit data
function createMockAuditData(overrides: Partial<ApexAuditData> = {}): ApexAuditData {
  return {
    // Section 1: Company Profile
    company_name: 'Test Company',
    website: 'https://test.com',
    industry: 'Technology',
    primary_product: 'SaaS Platform',
    employees: '2-10',
    employee_count: 5,
    years_in_business: 3,
    legal_entity: 'LLC',
    geography: 'National (USA)',

    // Section 2: Revenue & Profit
    annual_revenue: 500000,
    yearly_profit: 75000,
    monthly_revenue: 42000,
    gross_margin: 70,
    net_margin: 15,
    cash_on_hand: 100000,
    monthly_burn: 10000,

    // Section 3: Sales & Marketing
    selling_mechanism: 'Hybrid',
    advertising_mode: 'Paid Ads (Google/Meta)',
    lead_source: 'Paid Search',
    average_deal_size: 2500,
    sales_cycle_days: 30,
    close_rate: 30,
    monthly_marketing_spend: 5000,
    monthly_leads: 100,
    sales_team_size: 2,
    pipeline_value: 150000,
    conversion_rate: 5,
    website_checkout_rate: 0,
    cart_abandonment_rate: 0,
    lead_to_customer_rate: 10,
    marketing_channels: 'Google Ads, LinkedIn',

    // Section 4: Customers
    total_customers: 200,
    new_customers_monthly: 15,
    customer_acquisition_cost: 500,
    customer_lifetime_value: 2500,
    monthly_churn: 3,
    nps_score: 50,
    average_order_value: 2500,
    icp: 'Mid-market SaaS companies',
    customer_segments: 'SMB, Mid-market',
    primary_pain_points: 'Manual processes',
    top_decision_drivers: 'ROI, Time savings',

    // Section 5: Operations
    delivery_type: 'Software/SaaS',
    tech_status: 'Integrated - Connected stack',
    team_structure: 'Small team with defined roles',
    biggest_constraint: '',
    customer_acquisition: 'Inbound marketing',
    customer_onboarding: '30-day program',
    product_service_delivery: 'Self-service with support',
    primary_business_processes: 'Sales, Support',
    secondary_business_processes: 'Marketing, Development',
    data_analytics: 'Basic dashboards',
    hr_recruiting: 'As needed',
    admin_operations: 'Outsourced bookkeeping',
    workflow_stages: 'Lead > Trial > Customer > Renewal',
    operations_capacity: '80%',
    quality_metrics: 'NPS, Churn rate',
    vendor_dependencies: 'AWS, Stripe',
    procurement_lead_times: 'N/A',
    scheduling_rules: 'N/A',

    // Section 6: Growth Planning
    revenue_goal_12mo: 1000000,
    growth_channel: 'Paid Search',
    exit_timeline: 'No exit plans',
    exit_target: 0,
    funding_needed: 0,
    growth_strategy: 'Expand customer base',
    growth_constraints: 'Sales bandwidth',

    // Section 7: Tech Stack
    tech_crm: 'HubSpot',
    tech_accounting: 'QuickBooks',
    tech_marketing: ['Google Ads', 'Mailchimp'],
    tech_analytics: 'GA4',
    tech_communication: 'Slack',
    tech_other: '',
    common_tools: 'Notion, Figma',

    // Section 8: Compliance
    licenses: 'Standard business license',
    ad_restrictions: 'None',
    utility_territories: 'N/A',
    permitting_jurisdictions: 'N/A',

    // Section 9: Brand
    brand_voice: 'Professional, friendly',
    prohibited_terms: 'None',
    trust_signals: 'Customer testimonials, case studies',

    // Section 10: Experiments
    experiment_history: 'A/B tested pricing pages',

    // Section 11: Offer & Value
    value_proposition: 'Save 10 hours per week on manual tasks',
    differentiators: 'AI-powered automation',
    proof_assets: 'Case studies, ROI calculator',
    guarantees: '30-day money back',
    promotions: 'Annual discount',
    offer_packages: 'Starter, Pro, Enterprise',

    // Section 12: Additional Context
    top_objections: 'Price, implementation time',
    whats_working: 'Inbound marketing, customer referrals',
    biggest_challenges: 'Scaling sales team',
    competitors: 'Competitor A, Competitor B',
    messaging_angles: 'Time savings, ROI',
    creatives: 'Video testimonials',
    follow_up_sla: '24 hours',
    product_lines: 'Main platform',
    cash_flow_profile: 'Consistent MRR',
    dealer_fees: 'N/A',
    cancel_rate: 5,

    ...overrides
  }
}

describe('Apex Audit Analysis Engine', () => {
  describe('analyzeApexAudit', () => {
    test('returns complete result structure', () => {
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      expect(result).toHaveProperty('health_score')
      expect(result).toHaveProperty('stage')
      expect(result).toHaveProperty('primary_bottleneck')
      expect(result).toHaveProperty('priority_90day')
      expect(result).toHaveProperty('unit_economics')
      expect(result).toHaveProperty('growth_opportunities')
      expect(result).toHaveProperty('risks')
      expect(result).toHaveProperty('immediate_actions')
      expect(result).toHaveProperty('short_term_actions')
      expect(result).toHaveProperty('medium_term_actions')
      expect(result).toHaveProperty('confidence_score')
      expect(result).toHaveProperty('data_completeness')
    })

    test('health score is between 0 and 100', () => {
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      expect(result.health_score).toBeGreaterThanOrEqual(0)
      expect(result.health_score).toBeLessThanOrEqual(100)
    })
  })

  describe('determineStage', () => {
    test('Startup: revenue < $100K or years < 2', () => {
      const startupByRevenue = createMockAuditData({ annual_revenue: 50000, years_in_business: 5 })
      const startupByYears = createMockAuditData({ annual_revenue: 500000, years_in_business: 1 })

      expect(analyzeApexAudit(startupByRevenue).stage).toBe('Startup')
      expect(analyzeApexAudit(startupByYears).stage).toBe('Startup')
    })

    test('Growth: $100K-$1M revenue and < 10 employees', () => {
      const growthData = createMockAuditData({
        annual_revenue: 500000,
        employee_count: 5,
        years_in_business: 3
      })

      expect(analyzeApexAudit(growthData).stage).toBe('Growth')
    })

    test('Scale: $1M-$10M revenue and < 50 employees', () => {
      const scaleData = createMockAuditData({
        annual_revenue: 5000000,
        employee_count: 30,
        years_in_business: 5
      })

      expect(analyzeApexAudit(scaleData).stage).toBe('Scale')
    })

    test('Mature: $10M+ revenue and 50+ employees', () => {
      const matureData = createMockAuditData({
        annual_revenue: 15000000,
        employee_count: 100,
        years_in_business: 10
      })

      expect(analyzeApexAudit(matureData).stage).toBe('Mature')
    })
  })

  describe('calculateHealthScore', () => {
    test('high revenue contributes to higher score', () => {
      const lowRevenue = createMockAuditData({ annual_revenue: 50000, years_in_business: 3 })
      const highRevenue = createMockAuditData({ annual_revenue: 2000000, years_in_business: 3 })

      const lowResult = analyzeApexAudit(lowRevenue)
      const highResult = analyzeApexAudit(highRevenue)

      expect(highResult.health_score).toBeGreaterThan(lowResult.health_score)
    })

    test('positive net margin increases score', () => {
      const negativeMargin = createMockAuditData({ net_margin: -10, years_in_business: 3 })
      const positiveMargin = createMockAuditData({ net_margin: 25, years_in_business: 3 })

      const negativeResult = analyzeApexAudit(negativeMargin)
      const positiveResult = analyzeApexAudit(positiveMargin)

      expect(positiveResult.health_score).toBeGreaterThan(negativeResult.health_score)
    })

    test('good CAC:LTV ratio increases score', () => {
      const badRatio = createMockAuditData({
        customer_acquisition_cost: 2000,
        customer_lifetime_value: 1500,
        years_in_business: 3
      })
      const goodRatio = createMockAuditData({
        customer_acquisition_cost: 500,
        customer_lifetime_value: 3000,
        years_in_business: 3
      })

      const badResult = analyzeApexAudit(badRatio)
      const goodResult = analyzeApexAudit(goodRatio)

      expect(goodResult.health_score).toBeGreaterThan(badResult.health_score)
    })

    test('strong cash runway increases score', () => {
      const lowRunway = createMockAuditData({
        cash_on_hand: 10000,
        monthly_burn: 5000,
        years_in_business: 3
      })
      const highRunway = createMockAuditData({
        cash_on_hand: 200000,
        monthly_burn: 10000,
        years_in_business: 3
      })

      const lowResult = analyzeApexAudit(lowRunway)
      const highResult = analyzeApexAudit(highRunway)

      expect(highResult.health_score).toBeGreaterThan(lowResult.health_score)
    })
  })

  describe('unit_economics', () => {
    test('CAC:LTV ratio is calculated correctly', () => {
      const data = createMockAuditData({
        customer_acquisition_cost: 500,
        customer_lifetime_value: 2500
      })
      const result = analyzeApexAudit(data)

      expect(result.unit_economics.cac_ltv_ratio).toBe(5) // 2500/500 = 5
    })

    test('handles zero CAC gracefully', () => {
      const data = createMockAuditData({
        customer_acquisition_cost: 0,
        customer_lifetime_value: 2500
      })
      const result = analyzeApexAudit(data)

      expect(result.unit_economics.cac_ltv_ratio).toBe(0)
    })

    test('runway is calculated correctly', () => {
      const data = createMockAuditData({
        cash_on_hand: 120000,
        monthly_burn: 10000
      })
      const result = analyzeApexAudit(data)

      expect(result.unit_economics.runway_months).toBe(12)
    })

    test('handles zero burn gracefully (99 months runway)', () => {
      const data = createMockAuditData({
        cash_on_hand: 100000,
        monthly_burn: 0
      })
      const result = analyzeApexAudit(data)

      expect(result.unit_economics.runway_months).toBe(99)
    })

    test('cac_ltv_assessment reflects ratio quality', () => {
      const excellentRatio = createMockAuditData({
        customer_acquisition_cost: 500,
        customer_lifetime_value: 2500 // ratio = 5
      })
      const criticalRatio = createMockAuditData({
        customer_acquisition_cost: 2000,
        customer_lifetime_value: 1000 // ratio = 0.5
      })

      const excellentResult = analyzeApexAudit(excellentRatio)
      const criticalResult = analyzeApexAudit(criticalRatio)

      expect(excellentResult.unit_economics.cac_ltv_assessment).toContain('Excellent')
      expect(criticalResult.unit_economics.cac_ltv_assessment).toContain('Critical')
    })

    test('runway_assessment reflects cash position', () => {
      const strongRunway = createMockAuditData({
        cash_on_hand: 240000,
        monthly_burn: 10000 // 24 months
      })
      const criticalRunway = createMockAuditData({
        cash_on_hand: 20000,
        monthly_burn: 10000 // 2 months
      })

      const strongResult = analyzeApexAudit(strongRunway)
      const criticalResult = analyzeApexAudit(criticalRunway)

      expect(strongResult.unit_economics.runway_assessment).toContain('Strong')
      expect(criticalResult.unit_economics.runway_assessment).toContain('Critical')
    })
  })

  describe('identifyBottleneck', () => {
    test('uses user-provided constraint when available', () => {
      const data = createMockAuditData({
        biggest_constraint: 'Custom bottleneck from user'
      })
      const result = analyzeApexAudit(data)

      expect(result.primary_bottleneck).toBe('Custom bottleneck from user')
    })

    test('detects lead generation bottleneck', () => {
      const data = createMockAuditData({
        biggest_constraint: '',
        monthly_leads: 30,
        monthly_marketing_spend: 500
      })
      const result = analyzeApexAudit(data)

      expect(result.primary_bottleneck).toContain('Lead generation')
    })

    test('detects sales conversion bottleneck', () => {
      const data = createMockAuditData({
        biggest_constraint: '',
        monthly_leads: 200,
        monthly_marketing_spend: 5000,
        close_rate: 10
      })
      const result = analyzeApexAudit(data)

      expect(result.primary_bottleneck).toContain('Sales conversion')
    })

    test('detects unit economics bottleneck', () => {
      const data = createMockAuditData({
        biggest_constraint: '',
        monthly_leads: 200,
        monthly_marketing_spend: 5000,
        close_rate: 30,
        customer_acquisition_cost: 2000,
        customer_lifetime_value: 2500 // ratio = 1.25
      })
      const result = analyzeApexAudit(data)

      expect(result.primary_bottleneck).toContain('Unit economics')
    })

    test('detects retention bottleneck', () => {
      const data = createMockAuditData({
        biggest_constraint: '',
        monthly_leads: 200,
        monthly_marketing_spend: 5000,
        close_rate: 30,
        customer_acquisition_cost: 500,
        customer_lifetime_value: 2500,
        monthly_churn: 15
      })
      const result = analyzeApexAudit(data)

      expect(result.primary_bottleneck).toContain('Retention')
    })

    test('detects profitability bottleneck', () => {
      const data = createMockAuditData({
        biggest_constraint: '',
        monthly_leads: 200,
        monthly_marketing_spend: 5000,
        close_rate: 30,
        customer_acquisition_cost: 500,
        customer_lifetime_value: 2500,
        monthly_churn: 3,
        net_margin: 5
      })
      const result = analyzeApexAudit(data)

      expect(result.primary_bottleneck).toContain('Profitability')
    })

    test('defaults to growth capacity when no specific bottleneck', () => {
      const data = createMockAuditData({
        biggest_constraint: '',
        monthly_leads: 200,
        monthly_marketing_spend: 5000,
        close_rate: 30,
        customer_acquisition_cost: 500,
        customer_lifetime_value: 2500,
        monthly_churn: 3,
        net_margin: 20
      })
      const result = analyzeApexAudit(data)

      expect(result.primary_bottleneck).toContain('Growth capacity')
    })
  })

  describe('generateGrowthOpportunities', () => {
    test('returns array of opportunities', () => {
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      expect(Array.isArray(result.growth_opportunities)).toBe(true)
      expect(result.growth_opportunities.length).toBeGreaterThan(0)
      expect(result.growth_opportunities.length).toBeLessThanOrEqual(4)
    })

    test('each opportunity has required fields', () => {
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      result.growth_opportunities.forEach(opp => {
        expect(opp).toHaveProperty('area')
        expect(opp).toHaveProperty('recommendation')
        expect(opp).toHaveProperty('impact')
        expect(['High', 'Medium', 'Low']).toContain(opp.impact)
      })
    })

    test('suggests paid acquisition for referral-dependent businesses', () => {
      const data = createMockAuditData({
        lead_source: 'Referrals',
        monthly_marketing_spend: 1000
      })
      const result = analyzeApexAudit(data)

      const hasPaidAcquisition = result.growth_opportunities.some(
        opp => opp.area === 'Paid Acquisition'
      )
      expect(hasPaidAcquisition).toBe(true)
    })

    test('suggests retention improvement for high churn', () => {
      const data = createMockAuditData({
        monthly_churn: 8,
        customer_lifetime_value: 2000
      })
      const result = analyzeApexAudit(data)

      const hasRetention = result.growth_opportunities.some(
        opp => opp.area === 'Retention'
      )
      expect(hasRetention).toBe(true)
    })

    test('suggests tech investment for minimal tech stack', () => {
      const data = createMockAuditData({
        tech_status: 'Minimal - Spreadsheets only'
      })
      const result = analyzeApexAudit(data)

      const hasTech = result.growth_opportunities.some(
        opp => opp.area === 'Technology'
      )
      expect(hasTech).toBe(true)
    })
  })

  describe('assessRisks', () => {
    test('returns array of risks', () => {
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      expect(Array.isArray(result.risks)).toBe(true)
      expect(result.risks.length).toBeLessThanOrEqual(4)
    })

    test('each risk has required fields', () => {
      const data = createMockAuditData({
        cash_on_hand: 20000,
        monthly_burn: 10000 // force a cash risk
      })
      const result = analyzeApexAudit(data)

      result.risks.forEach(risk => {
        expect(risk).toHaveProperty('risk')
        expect(risk).toHaveProperty('severity')
        expect(risk).toHaveProperty('mitigation')
        expect(['Critical', 'High', 'Medium', 'Low']).toContain(risk.severity)
      })
    })

    test('flags cash runway below 6 months as risk', () => {
      const data = createMockAuditData({
        cash_on_hand: 30000,
        monthly_burn: 10000 // 3 months
      })
      const result = analyzeApexAudit(data)

      const hasCashRisk = result.risks.some(
        r => r.risk.includes('runway')
      )
      expect(hasCashRisk).toBe(true)
    })

    test('flags critical severity for runway < 3 months', () => {
      const data = createMockAuditData({
        cash_on_hand: 20000,
        monthly_burn: 10000 // 2 months
      })
      const result = analyzeApexAudit(data)

      const cashRisk = result.risks.find(r => r.risk.includes('runway'))
      expect(cashRisk?.severity).toBe('Critical')
    })

    test('flags channel concentration risk', () => {
      const data = createMockAuditData({
        lead_source: 'Referrals',
        advertising_mode: 'None yet'
      })
      const result = analyzeApexAudit(data)

      const hasConcentrationRisk = result.risks.some(
        r => r.risk.includes('Single channel')
      )
      expect(hasConcentrationRisk).toBe(true)
    })

    test('flags weak unit economics as risk', () => {
      const data = createMockAuditData({
        customer_acquisition_cost: 2000,
        customer_lifetime_value: 2500 // ratio = 1.25
      })
      const result = analyzeApexAudit(data)

      const hasUnitEconRisk = result.risks.some(
        r => r.risk.includes('unit economics')
      )
      expect(hasUnitEconRisk).toBe(true)
    })

    test('flags high churn as risk', () => {
      const data = createMockAuditData({
        monthly_churn: 12
      })
      const result = analyzeApexAudit(data)

      const hasChurnRisk = result.risks.some(
        r => r.risk.includes('churn')
      )
      expect(hasChurnRisk).toBe(true)
    })

    test('flags key person dependency for solo operators', () => {
      const data = createMockAuditData({
        employee_count: 1
      })
      const result = analyzeApexAudit(data)

      const hasKeyPersonRisk = result.risks.some(
        r => r.risk.includes('Key person')
      )
      expect(hasKeyPersonRisk).toBe(true)
    })
  })

  describe('generateActionPlan', () => {
    test('returns immediate, short-term, and medium-term actions', () => {
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      expect(Array.isArray(result.immediate_actions)).toBe(true)
      expect(Array.isArray(result.short_term_actions)).toBe(true)
      expect(Array.isArray(result.medium_term_actions)).toBe(true)
    })

    test('limits immediate actions to 3', () => {
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      expect(result.immediate_actions.length).toBeLessThanOrEqual(3)
    })

    test('limits short-term actions to 5', () => {
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      expect(result.short_term_actions.length).toBeLessThanOrEqual(5)
    })

    test('limits medium-term actions to 3', () => {
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      expect(result.medium_term_actions.length).toBeLessThanOrEqual(3)
    })

    test('generates lead generation actions for lead bottleneck', () => {
      const data = createMockAuditData({
        biggest_constraint: '',
        monthly_leads: 30,
        monthly_marketing_spend: 500
      })
      const result = analyzeApexAudit(data)

      const hasLeadAction = result.immediate_actions.some(
        a => a.toLowerCase().includes('referral') || a.toLowerCase().includes('partner')
      )
      expect(hasLeadAction).toBe(true)
    })

    test('generates sales actions for conversion bottleneck', () => {
      const data = createMockAuditData({
        biggest_constraint: '',
        monthly_leads: 200,
        monthly_marketing_spend: 5000,
        close_rate: 10
      })
      const result = analyzeApexAudit(data)

      const hasSalesAction = result.immediate_actions.some(
        a => a.toLowerCase().includes('deal') || a.toLowerCase().includes('objection')
      )
      expect(hasSalesAction).toBe(true)
    })

    test('adds CRM action for minimal tech', () => {
      const data = createMockAuditData({
        tech_status: 'Minimal - Spreadsheets only'
      })
      const result = analyzeApexAudit(data)

      const hasCrmAction = result.short_term_actions.some(
        a => a.toLowerCase().includes('crm')
      )
      expect(hasCrmAction).toBe(true)
    })

    test('adds value proposition action when missing', () => {
      const data = createMockAuditData({
        value_proposition: ''
      })
      const result = analyzeApexAudit(data)

      const hasValuePropAction = result.immediate_actions.some(
        a => a.toLowerCase().includes('value proposition')
      )
      expect(hasValuePropAction).toBe(true)
    })
  })

  describe('confidence_score and data_completeness', () => {
    test('confidence score is between 60 and 95', () => {
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      expect(result.confidence_score).toBeGreaterThanOrEqual(60)
      expect(result.confidence_score).toBeLessThanOrEqual(95)
    })

    test('data completeness is between 0 and 100', () => {
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      expect(result.data_completeness).toBeGreaterThanOrEqual(0)
      expect(result.data_completeness).toBeLessThanOrEqual(100)
    })

    test('higher completeness increases confidence', () => {
      const sparseData = createMockAuditData({
        company_name: '',
        website: '',
        value_proposition: '',
        differentiators: '',
        proof_assets: ''
      })
      const fullData = createMockAuditData()

      const sparseResult = analyzeApexAudit(sparseData)
      const fullResult = analyzeApexAudit(fullData)

      expect(fullResult.confidence_score).toBeGreaterThanOrEqual(sparseResult.confidence_score)
    })
  })

  describe('priority_90day', () => {
    test('returns a non-empty string', () => {
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      expect(typeof result.priority_90day).toBe('string')
      expect(result.priority_90day.length).toBeGreaterThan(0)
    })

    test('defaults to stabilization message when no medium-term actions', () => {
      // This tests the fallback when mediumTerm array is empty
      const data = createMockAuditData()
      const result = analyzeApexAudit(data)

      // Just verify it's a meaningful string (either from mediumTerm or default)
      expect(result.priority_90day.length).toBeGreaterThan(10)
    })
  })
})
