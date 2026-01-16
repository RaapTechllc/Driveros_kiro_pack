// Apex Audit Types - Ultra Premium Business Analysis

export interface ApexAuditData {
  // Section 1: Company Profile
  company_name: string
  website: string
  industry: string
  primary_product: string
  employees: string
  employee_count: number
  years_in_business: number
  legal_entity: string
  geography: string

  // Section 2: Revenue & Profit
  annual_revenue: number
  yearly_profit: number
  monthly_revenue: number
  gross_margin: number
  net_margin: number
  cash_on_hand: number
  monthly_burn: number

  // Section 3: Sales & Marketing
  selling_mechanism: string
  advertising_mode: string
  lead_source: string
  average_deal_size: number
  sales_cycle_days: number
  close_rate: number
  monthly_marketing_spend: number
  monthly_leads: number
  sales_team_size: number
  pipeline_value: number

  // Section 4: Customers
  total_customers: number
  new_customers_monthly: number
  customer_acquisition_cost: number
  customer_lifetime_value: number
  monthly_churn: number
  nps_score: number
  average_order_value: number

  // Section 5: Operations
  delivery_type: string
  tech_status: string
  team_structure: string
  biggest_constraint: string

  // Section 6: Growth Planning
  revenue_goal_12mo: number
  growth_channel: string
  exit_timeline: string
  exit_target: number

  // Section 7: Tech Stack
  tech_crm: string
  tech_accounting: string
  tech_marketing: string[]
  tech_analytics: string
  tech_communication: string

  // Section 8: Additional Context
  value_proposition: string
  differentiators: string
  top_objections: string
  whats_working: string
  biggest_challenges: string
}

export interface ApexAuditResult {
  // Executive Summary
  health_score: number
  stage: 'Startup' | 'Growth' | 'Scale' | 'Mature'
  primary_bottleneck: string
  priority_90day: string

  // Financial Analysis
  unit_economics: {
    cac_ltv_ratio: number
    cac_ltv_assessment: string
    margin_opportunity: string
    runway_months: number
    runway_assessment: string
  }

  // Growth Analysis
  growth_opportunities: Array<{
    area: string
    recommendation: string
    impact: 'High' | 'Medium' | 'Low'
  }>

  // Risk Assessment
  risks: Array<{
    risk: string
    severity: 'Critical' | 'High' | 'Medium' | 'Low'
    mitigation: string
  }>

  // Action Plan
  immediate_actions: string[] // This week
  short_term_actions: string[] // 30 days
  medium_term_actions: string[] // 90 days

  // Confidence
  confidence_score: number
  data_completeness: number
}

// Dropdown options
export const APEX_OPTIONS = {
  industry: [
    'Home Services',
    'Technology',
    'Healthcare',
    'Finance',
    'Retail',
    'Manufacturing',
    'Professional Services',
    'Construction',
    'Other'
  ],
  employees: [
    'Just me (1)',
    '2-10',
    '11-50',
    '51-200',
    '200+'
  ],
  legal_entity: [
    'Sole Proprietorship',
    'LLC',
    'S-Corp',
    'C-Corp',
    'Partnership'
  ],
  geography: [
    'Local',
    'Regional',
    'National (USA)',
    'North America',
    'International'
  ],
  selling_mechanism: [
    'In-Person + Salesperson',
    'Phone Sales',
    'Online/Self-Serve',
    'Hybrid'
  ],
  advertising_mode: [
    'Paid Ads (Google/Meta)',
    'SEO/Content',
    'Social Media',
    'Warm Outreach',
    'Cold Outreach',
    'None yet'
  ],
  lead_source: [
    'Referrals',
    'Paid Search',
    'Social Media',
    'Content/SEO',
    'Events/Networking',
    'Partnerships',
    'Other'
  ],
  delivery_type: [
    'Done for you',
    'Done with you',
    'DIY/Self-serve',
    'Physical Product',
    'Software/SaaS'
  ],
  tech_status: [
    'Minimal - Spreadsheets only',
    'Basic - CRM and a few tools',
    'Integrated - Connected stack',
    'Advanced - Custom systems'
  ],
  constraint: [
    'Cash flow',
    'Capacity/Bandwidth',
    'Demand/Leads',
    'Delivery/Fulfillment',
    'People/Hiring',
    'Marketing',
    'Technology',
    'Strategy/Direction'
  ],
  growth_channel: [
    'Paid Search',
    'Paid Social',
    'SEO/Content',
    'Referral Program',
    'Partnerships',
    'Sales Team Expansion',
    'New Markets',
    'New Products'
  ],
  exit_timeline: [
    'No exit plans',
    '1-2 years',
    '3-5 years',
    '5+ years'
  ],
  crm: ['HubSpot', 'Salesforce', 'Pipedrive', 'Other', 'None'],
  accounting: ['QuickBooks', 'Xero', 'NetSuite', 'FreshBooks', 'Other', 'None'],
  analytics: ['GA4', 'Mixpanel', 'Amplitude', 'Custom', 'None']
}

// Default/suggested values for the form
export const APEX_DEFAULTS: Partial<ApexAuditData> = {
  employees: 'Just me (1)',
  employee_count: 1,
  years_in_business: 1,
  legal_entity: 'LLC',
  geography: 'Local',
  gross_margin: 50,
  net_margin: 15,
  close_rate: 30,
  monthly_churn: 5,
  nps_score: 50,
  delivery_type: 'Done for you',
  tech_status: 'Basic - CRM and a few tools',
  exit_timeline: 'No exit plans'
}
