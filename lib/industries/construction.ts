/**
 * Construction Industry Plugin
 *
 * First industry plugin for DriverOS. Provides construction-specific
 * diagnostic questions, KPIs, compliance items, and templates.
 */

import type { GearNumber } from '@/lib/types'
import type {
  IndustryPlugin,
  IndustryQuestion,
  IndustryKPI,
  ComplianceItem,
  DocumentTemplate,
  SeasonalPattern,
  MarketDataPoint,
} from './types'

const questions: IndustryQuestion[] = [
  {
    id: 'con-backlog',
    engine: 'revenue',
    question: 'How many months of signed backlog do you have?',
    rationale: 'Backlog visibility determines cash flow predictability and hiring decisions',
    gearRelevance: [1, 2, 3, 4, 5],
    scoring: {
      low: 'Less than 2 months — vulnerable to gaps',
      mid: '3-6 months — healthy pipeline',
      high: '6-12+ months — strong position, watch capacity',
    },
  },
  {
    id: 'con-change-orders',
    engine: 'finance',
    question: 'What percentage of your revenue comes from change orders?',
    rationale: 'High change order rates indicate scope management issues or strategic upselling',
    gearRelevance: [2, 3, 4],
    scoring: {
      low: '<5% — may be leaving money on table or under-managing scope',
      mid: '5-15% — healthy range',
      high: '>15% — could indicate poor initial scoping',
    },
  },
  {
    id: 'con-estimating',
    engine: 'operations',
    question: 'How accurate are your estimates vs. actual project costs?',
    rationale: 'Estimating accuracy directly impacts profit margins and trust',
    gearRelevance: [2, 3, 4, 5],
    scoring: {
      low: 'Regularly off by >15% — need system overhaul',
      mid: 'Within 5-15% — room to improve',
      high: 'Consistently within 5% — strong estimating discipline',
    },
  },
  {
    id: 'con-safety',
    engine: 'people',
    question: 'What is your Experience Modification Rate (EMR)?',
    rationale: 'EMR affects insurance costs and ability to bid certain projects',
    gearRelevance: [2, 3, 4, 5],
    scoring: {
      low: '>1.2 — high risk, insurance costs elevated',
      mid: '0.8-1.0 — average safety record',
      high: '<0.8 — excellent safety program',
    },
  },
  {
    id: 'con-sub-management',
    engine: 'operations',
    question: 'Do you have a scored subcontractor qualification process?',
    rationale: 'Sub quality directly impacts project delivery, safety, and client satisfaction',
    gearRelevance: [2, 3, 4],
    scoring: {
      low: 'No formal process — hire based on availability/price',
      mid: 'Some vetting — check references and insurance',
      high: 'Formal scorecard — track performance across projects',
    },
  },
  {
    id: 'con-pm-ratio',
    engine: 'people',
    question: 'What is your PM-to-project ratio?',
    rationale: 'Overloaded PMs lead to quality issues and client complaints',
    gearRelevance: [3, 4, 5],
    scoring: {
      low: '>8 projects per PM — overloaded',
      mid: '4-6 projects per PM — manageable',
      high: '2-4 projects per PM — can focus on quality',
    },
  },
  {
    id: 'con-retention',
    engine: 'finance',
    question: 'How do you manage retainage and final billing?',
    rationale: 'Poor retainage management is a top cash flow killer in construction',
    gearRelevance: [2, 3, 4],
    scoring: {
      low: 'No tracking — retainage often forgotten or delayed',
      mid: 'Track manually — collected within 90 days',
      high: 'Automated tracking — collected within 45 days of substantial completion',
    },
  },
  {
    id: 'con-technology',
    engine: 'operations',
    question: 'What project management technology stack do you use?',
    rationale: 'Tech adoption separates scaling contractors from stagnant ones',
    gearRelevance: [2, 3, 4, 5],
    scoring: {
      low: 'Paper/email-based — high error risk',
      mid: 'Basic tools (spreadsheets, simple PM software)',
      high: 'Integrated platform (Procore, Buildertrend, etc.) with mobile access',
    },
  },
]

const kpis: IndustryKPI[] = [
  {
    id: 'con-gross-margin',
    name: 'Gross Profit Margin',
    description: 'Revenue minus direct costs (labor, materials, subs) divided by revenue',
    engine: 'finance',
    formula: '(Revenue - Direct Costs) / Revenue × 100',
    unit: '%',
    benchmarks: {
      2: { poor: 15, average: 22, good: 28, elite: 35 },
      3: { poor: 18, average: 25, good: 32, elite: 38 },
      4: { poor: 20, average: 28, good: 35, elite: 42 },
    },
    dataSourceHint: 'P&L statement or job costing reports',
  },
  {
    id: 'con-backlog-months',
    name: 'Backlog (Months)',
    description: 'Total contracted but unfinished work divided by monthly revenue run rate',
    engine: 'revenue',
    formula: 'Total Backlog $ / Monthly Revenue Run Rate',
    unit: 'months',
    benchmarks: {
      2: { poor: 1, average: 3, good: 6, elite: 9 },
      3: { poor: 2, average: 4, good: 8, elite: 12 },
      4: { poor: 3, average: 6, good: 10, elite: 14 },
    },
    dataSourceHint: 'WIP report or contract log',
  },
  {
    id: 'con-bid-hit-rate',
    name: 'Bid-to-Win Ratio',
    description: 'Percentage of bids that convert to signed contracts',
    engine: 'revenue',
    formula: 'Won Bids / Total Bids × 100',
    unit: '%',
    benchmarks: {
      2: { poor: 10, average: 20, good: 30, elite: 45 },
      3: { poor: 15, average: 25, good: 35, elite: 50 },
      4: { poor: 20, average: 30, good: 40, elite: 55 },
    },
    dataSourceHint: 'CRM or bid tracking spreadsheet',
  },
  {
    id: 'con-ar-days',
    name: 'Accounts Receivable Days',
    description: 'Average days to collect payment after invoicing',
    engine: 'finance',
    formula: '(Total AR / Annual Revenue) × 365',
    unit: 'days',
    benchmarks: {
      2: { poor: 75, average: 55, good: 40, elite: 30 },
      3: { poor: 65, average: 48, good: 35, elite: 25 },
      4: { poor: 55, average: 42, good: 30, elite: 20 },
    },
    dataSourceHint: 'Accounting software AR aging report',
  },
  {
    id: 'con-rework-rate',
    name: 'Rework Rate',
    description: 'Cost of rework/warranty as percentage of total project cost',
    engine: 'operations',
    formula: 'Rework Costs / Total Project Cost × 100',
    unit: '%',
    benchmarks: {
      2: { poor: 8, average: 5, good: 3, elite: 1 },
      3: { poor: 6, average: 4, good: 2, elite: 1 },
      4: { poor: 4, average: 3, good: 1.5, elite: 0.5 },
    },
    dataSourceHint: 'Job cost detail or warranty claim records',
  },
  {
    id: 'con-emr',
    name: 'Experience Modification Rate (EMR)',
    description: 'Worker comp modifier based on safety record vs. industry average',
    engine: 'people',
    formula: 'Set by insurance carrier based on claims history',
    unit: 'ratio',
    benchmarks: {
      2: { poor: 1.3, average: 1.0, good: 0.85, elite: 0.7 },
      3: { poor: 1.2, average: 0.95, good: 0.8, elite: 0.65 },
      4: { poor: 1.1, average: 0.9, good: 0.75, elite: 0.6 },
    },
    dataSourceHint: 'Insurance carrier annual mod worksheet',
  },
]

const compliance: ComplianceItem[] = [
  {
    id: 'con-osha-general',
    name: 'OSHA Safety Standards',
    description: 'General construction safety standards (29 CFR 1926)',
    authority: 'OSHA',
    riskLevel: 'critical',
    reviewCadenceDays: 90,
    engine: 'people',
  },
  {
    id: 'con-bonding',
    name: 'Bonding & Insurance',
    description: 'Performance/payment bonds, GL, workers comp, auto coverage',
    authority: 'State / Project Owner',
    riskLevel: 'critical',
    reviewCadenceDays: 365,
    engine: 'finance',
  },
  {
    id: 'con-licensing',
    name: 'Contractor Licensing',
    description: 'State and local contractor license requirements and renewals',
    authority: 'State Licensing Board',
    riskLevel: 'high',
    reviewCadenceDays: 365,
    engine: 'operations',
  },
  {
    id: 'con-prevailing-wage',
    name: 'Prevailing Wage Compliance',
    description: 'Davis-Bacon and state prevailing wage requirements on public projects',
    authority: 'DOL / State Labor',
    riskLevel: 'high',
    reviewCadenceDays: 30,
    engine: 'finance',
  },
  {
    id: 'con-lien-waivers',
    name: 'Lien Waiver Management',
    description: 'Tracking conditional/unconditional lien waivers from subs and suppliers',
    authority: 'State Law',
    riskLevel: 'medium',
    reviewCadenceDays: 30,
    engine: 'finance',
  },
  {
    id: 'con-environmental',
    name: 'Environmental Permits',
    description: 'SWPPP, dust control, erosion permits, hazmat handling',
    authority: 'EPA / State DEQ',
    riskLevel: 'high',
    reviewCadenceDays: 90,
    engine: 'operations',
  },
]

const templates: DocumentTemplate[] = [
  {
    id: 'con-change-order',
    name: 'Change Order',
    description: 'Formal request for changes to contract scope, cost, or timeline',
    category: 'operations',
    gearRelevance: [2, 3, 4, 5],
    fields: [
      { name: 'project_name', type: 'text', required: true },
      { name: 'co_number', type: 'number', required: true },
      { name: 'description', type: 'textarea', required: true },
      { name: 'cost_impact', type: 'number', required: true },
      { name: 'schedule_impact_days', type: 'number', required: true },
      { name: 'reason', type: 'select', required: true, options: ['Owner Request', 'Design Error', 'Unforeseen Condition', 'Code Requirement', 'Value Engineering'] },
      { name: 'requested_date', type: 'date', required: true },
    ],
  },
  {
    id: 'con-rfi',
    name: 'Request for Information (RFI)',
    description: 'Formal request to clarify design intent, specifications, or conditions',
    category: 'operations',
    gearRelevance: [2, 3, 4, 5],
    fields: [
      { name: 'project_name', type: 'text', required: true },
      { name: 'rfi_number', type: 'number', required: true },
      { name: 'question', type: 'textarea', required: true },
      { name: 'suggested_resolution', type: 'textarea', required: false },
      { name: 'cost_impact', type: 'select', required: true, options: ['None', 'Possible', 'Yes - TBD', 'Yes - Quantified'] },
      { name: 'needed_by', type: 'date', required: true },
    ],
  },
  {
    id: 'con-punch-list',
    name: 'Punch List',
    description: 'List of items requiring completion or correction before final acceptance',
    category: 'operations',
    gearRelevance: [2, 3, 4, 5],
    fields: [
      { name: 'project_name', type: 'text', required: true },
      { name: 'area_location', type: 'text', required: true },
      { name: 'item_description', type: 'textarea', required: true },
      { name: 'responsible_party', type: 'text', required: true },
      { name: 'due_date', type: 'date', required: true },
      { name: 'status', type: 'select', required: true, options: ['Open', 'In Progress', 'Complete', 'Disputed'] },
    ],
  },
  {
    id: 'con-daily-report',
    name: 'Daily Field Report',
    description: 'Daily log of weather, manpower, work performed, and issues',
    category: 'operations',
    gearRelevance: [1, 2, 3, 4, 5],
    fields: [
      { name: 'project_name', type: 'text', required: true },
      { name: 'date', type: 'date', required: true },
      { name: 'weather', type: 'select', required: true, options: ['Clear', 'Cloudy', 'Rain', 'Snow', 'Wind', 'Extreme Heat'] },
      { name: 'crew_count', type: 'number', required: true },
      { name: 'work_performed', type: 'textarea', required: true },
      { name: 'delays', type: 'textarea', required: false },
      { name: 'safety_incidents', type: 'textarea', required: false },
      { name: 'visitor_log', type: 'textarea', required: false },
    ],
  },
  {
    id: 'con-sub-scorecard',
    name: 'Subcontractor Scorecard',
    description: 'Performance evaluation template for subcontractors',
    category: 'people',
    gearRelevance: [3, 4, 5],
    fields: [
      { name: 'sub_name', type: 'text', required: true },
      { name: 'trade', type: 'text', required: true },
      { name: 'quality_score', type: 'number', required: true },
      { name: 'schedule_score', type: 'number', required: true },
      { name: 'safety_score', type: 'number', required: true },
      { name: 'communication_score', type: 'number', required: true },
      { name: 'notes', type: 'textarea', required: false },
    ],
  },
]

const seasonalPatterns: SeasonalPattern[] = [
  {
    id: 'con-winter-slowdown',
    name: 'Winter Slowdown',
    months: [12, 1, 2],
    impact: 'Exterior work pauses in cold climates; interior trades stay busy. Cash flow tightens.',
    preparations: [
      'Build cash reserves by October',
      'Schedule interior-only work for winter months',
      'Use downtime for training and certification',
      'Bid aggressively for spring start projects',
    ],
    engine: 'finance',
  },
  {
    id: 'con-spring-surge',
    name: 'Spring Construction Surge',
    months: [3, 4, 5],
    impact: 'Highest demand for labor and materials. Prices rise, availability drops.',
    preparations: [
      'Lock in material pricing by February',
      'Pre-book key subcontractors',
      'Staff up before competitors do',
      'Ensure bonding capacity is current',
    ],
    engine: 'operations',
  },
  {
    id: 'con-fiscal-year',
    name: 'Government Fiscal Year End',
    months: [8, 9],
    impact: 'Public project bids spike as agencies spend remaining budget.',
    preparations: [
      'Monitor public bid boards actively',
      'Ensure bonding capacity for larger projects',
      'Have estimating bandwidth available',
    ],
    engine: 'revenue',
  },
  {
    id: 'con-hurricane-season',
    name: 'Hurricane/Storm Season',
    months: [6, 7, 8, 9, 10],
    impact: 'Storm damage creates emergency demand; also causes project delays.',
    preparations: [
      'Review insurance coverage and deductibles',
      'Have emergency response plan ready',
      'Pre-position materials for restoration work',
      'Build relationships with adjusters',
    ],
    engine: 'operations',
  },
]

const marketData: MarketDataPoint[] = [
  {
    id: 'con-lumber',
    name: 'Lumber Prices',
    description: 'Framing lumber composite price index',
    trend: 'stable',
    businessImpact: 'Directly affects bid accuracy for wood-frame projects',
    engine: 'finance',
  },
  {
    id: 'con-labor',
    name: 'Construction Labor Availability',
    description: 'Skilled trade labor market tightness',
    trend: 'down',
    businessImpact: 'Labor shortages increase costs and extend timelines',
    engine: 'people',
  },
  {
    id: 'con-steel',
    name: 'Steel Prices',
    description: 'Hot-rolled coil steel price index',
    trend: 'stable',
    businessImpact: 'Affects structural and commercial project costs',
    engine: 'finance',
  },
  {
    id: 'con-interest-rates',
    name: 'Interest Rates',
    description: 'Federal funds rate affecting construction lending',
    trend: 'down',
    businessImpact: 'Lower rates increase new construction starts; higher rates slow development',
    engine: 'revenue',
  },
  {
    id: 'con-permits',
    name: 'Building Permit Activity',
    description: 'New building permit issuance trend (leading indicator)',
    trend: 'stable',
    businessImpact: 'Leading indicator of future construction demand 6-12 months out',
    engine: 'revenue',
  },
]

export const constructionPlugin: IndustryPlugin = {
  id: 'construction',
  name: 'Construction',
  description: 'General contracting, subcontracting, specialty trades, and construction management',
  icon: '🏗️',

  questions,
  kpis,
  compliance,
  templates,
  seasonalPatterns,
  marketData,

  getPromptContext(gear: GearNumber): string {
    const relevantKPIs = this.getKeyKPIs(gear)
    const seasonalAlerts = this.getActiveSeasonalAlerts()

    const parts = [
      '## Industry Context: Construction',
      `This is a Gear ${gear} construction company.`,
      '',
      '### Key KPIs to Reference:',
      ...relevantKPIs.map(k => {
        const bench = k.benchmarks[gear]
        return bench
          ? `- **${k.name}**: Good = ${bench.good}${k.unit}, Elite = ${bench.elite}${k.unit}`
          : `- **${k.name}**: ${k.description}`
      }),
    ]

    if (seasonalAlerts.length > 0) {
      parts.push('', '### Active Seasonal Considerations:')
      for (const alert of seasonalAlerts) {
        parts.push(`- **${alert.name}**: ${alert.impact}`)
      }
    }

    parts.push(
      '',
      '### Construction-Specific Coaching Notes:',
      '- Cash flow is king — AR days and retainage management matter more than revenue',
      '- Safety (EMR) directly affects ability to bid and insurance costs',
      '- Backlog visibility determines hiring and equipment decisions',
      '- Change order management is a profit center when done well',
      '- Sub quality is the single biggest variable in project outcomes',
    )

    return parts.join('\n')
  },

  getKeyKPIs(gear: GearNumber): IndustryKPI[] {
    return kpis.filter(k => k.benchmarks[gear] !== undefined)
  },

  getActiveSeasonalAlerts(): SeasonalPattern[] {
    const currentMonth = new Date().getMonth() + 1
    return seasonalPatterns.filter(p => p.months.includes(currentMonth))
  },
}
