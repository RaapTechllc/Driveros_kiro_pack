/**
 * DriverOS Engine Definitions
 *
 * The 5 engines diagnose business health across key operational pillars.
 * Based on EOS, Empire OS, Hormozi, and Wilson frameworks.
 */

import type { FrameworkEngineName } from '../types'

export interface EngineDefinition {
  id: FrameworkEngineName
  name: string
  displayName: string
  description: string
  frameworkSources: string[]
  diagnosticQuestions: string[]
  scoringCriteria: {
    high: string
    partial: string
    low: string
  }
  flags: {
    description: string
    severity: 'critical' | 'warning'
  }[]
  commonMistakes: {
    mistake: string
    diagnostic: string
  }[]
}

/**
 * Vision Engine - Clarity & Strategy
 * Ensures the business has a clear direction and the team is aligned
 */
export const VISION_ENGINE: EngineDefinition = {
  id: 'vision',
  name: 'vision',
  displayName: 'Vision',
  description: 'Clarity & Strategy - Clear direction, team alignment, mission-driven focus',
  frameworkSources: [
    'EOS Vision Component (Vision/Traction Organizer)',
    'Empire OS Phases - business life-cycle alignment'
  ],
  diagnosticQuestions: [
    'What is our 3-10 year vision and core purpose, and does the team know it?',
    'Are quarterly priorities and long-term mission clearly communicated and understood by all?',
    'Is our strategy appropriate for our current phase/gear?'
  ],
  scoringCriteria: {
    high: 'Vision documented (mission, values, goals) and shared; team gives consistent answers on priorities (+20)',
    partial: 'Vision exists but vague or not universally known (+10)',
    low: 'No clear written vision or conflicting priorities (0)'
  },
  flags: [
    { description: 'No written vision/strategy - team winging it', severity: 'critical' },
    { description: 'Team members have different answers on priorities', severity: 'warning' },
    { description: 'Shiny-object syndrome - frequent pivots distracting from core plan', severity: 'warning' },
    { description: 'Vision not matching current phase', severity: 'warning' }
  ],
  commonMistakes: [
    {
      mistake: 'Vision not communicated',
      diagnostic: 'Ask a random employee about the company mission; blank stares = issue'
    },
    {
      mistake: 'Too many priorities',
      diagnostic: 'If top 5 priorities exceed capacity, focus is lacking'
    },
    {
      mistake: 'Ignoring core values',
      diagnostic: 'Check if decisions ever reference core values; if not, they may be wall art'
    }
  ]
}

/**
 * People Engine - Team & Structure
 * Right people in right seats with clear accountability
 */
export const PEOPLE_ENGINE: EngineDefinition = {
  id: 'people',
  name: 'people',
  displayName: 'People',
  description: 'Team & Structure - Right people, right seats, clear accountability',
  frameworkSources: [
    'EOS People Component - Right People, Right Seats',
    'EOS GWC Framework - Get it, Want it, Capacity to do it',
    'Empire Personnel Pillar - org chart clarity, roles'
  ],
  diagnosticQuestions: [
    'Do we have the right people (culture-fit, core values) on the team?',
    'Do we have an accountability chart with everyone in the right seat?',
    'If a key person quit or CEO took a month off, can others cover?'
  ],
  scoringCriteria: {
    high: 'All key seats filled with culture-fit people; clear owner for every function (+20)',
    partial: 'Minor people issues - few mismatches or vacant seats (+10)',
    low: 'Team structure unclear or many wrong fits; CEO wears all hats (0)'
  },
  flags: [
    { description: 'Keeping team members who lack GWC or core values', severity: 'warning' },
    { description: 'No second-in-command - CEO is single point of failure', severity: 'critical' },
    { description: 'Toxic culture or infighting', severity: 'critical' },
    { description: 'Key functions unowned - important work falls through cracks', severity: 'warning' }
  ],
  commonMistakes: [
    {
      mistake: 'Wrong person, right seat',
      diagnostic: 'Skilled people who don\'t fit values kept too long'
    },
    {
      mistake: 'Founder does it all',
      diagnostic: 'CEO approves every decision or works 80+ hours'
    },
    {
      mistake: 'Undefined roles',
      diagnostic: 'Ask "Who owns X process?" - if ambiguous, that\'s an issue'
    },
    {
      mistake: 'Hiring for speed over fit',
      diagnostic: 'High new hire turnover or constant firefighting training'
    }
  ]
}

/**
 * Operations Engine - Systems & Execution
 * Documented processes, execution cadence, key metrics
 */
export const OPERATIONS_ENGINE: EngineDefinition = {
  id: 'operations',
  name: 'operations',
  displayName: 'Operations',
  description: 'Systems & Execution - Documented processes, meeting cadence, key metrics',
  frameworkSources: [
    'EOS Process Component - Documented core processes, followed by all',
    'EOS Traction/Meetings - Level-10 meetings, IDS',
    'Empire Operations Pillar - SOPs and process control',
    'Wilson\'s Brick - single most important daily metric'
  ],
  diagnosticQuestions: [
    'Do we have documented processes for core activities that are actually followed?',
    'What is our meeting rhythm for accountability (daily huddles, weekly leadership)?',
    'What is the one metric (Brick) that drives success, tracked daily?',
    'Can the business run without constant heroics or micromanagement?'
  ],
  scoringCriteria: {
    high: 'Core processes documented and used; regular meeting pulse; Brick metric tracked daily (+20)',
    partial: 'Some processes documented but not updated; basic meeting cadence only (+10)',
    low: 'Operations ad-hoc and person-dependent; no written SOPs or metrics (0)'
  },
  flags: [
    { description: 'No SOPs or outdated SOPs - tribal knowledge only', severity: 'critical' },
    { description: 'No KPI dashboard - decisions on gut feelings', severity: 'critical' },
    { description: 'Constant firefighting - root issues unresolved', severity: 'warning' },
    { description: 'Single-point process expertise - bottleneck to scaling', severity: 'warning' },
    { description: 'Founder-centric execution - can\'t step back', severity: 'critical' }
  ],
  commonMistakes: [
    {
      mistake: 'Automating chaos',
      diagnostic: 'Frequent tech tool changes indicate processes aren\'t solid yet'
    },
    {
      mistake: 'Meeting theater',
      diagnostic: 'Meetings end with no clear to-dos or same issues resurface'
    },
    {
      mistake: 'Neglecting the Brick',
      diagnostic: 'If asked for leading indicator, they respond with revenue or lag metric'
    },
    {
      mistake: 'Overly complex processes',
      diagnostic: 'Frontline employees can\'t quickly explain how to do a task'
    }
  ]
}

/**
 * Revenue Engine - Marketing & Sales
 * Lead generation, offer strength, unit economics, sales process
 */
export const REVENUE_ENGINE: EngineDefinition = {
  id: 'revenue',
  name: 'revenue',
  displayName: 'Revenue',
  description: 'Marketing & Sales - Lead gen, offer strength, unit economics, pipeline',
  frameworkSources: [
    'Hormozi Grand Slam Offer - high value, guarantees, bonuses',
    'Hormozi Core Four - warm/cold outbound, paid ads, content',
    'LTV:CAC economics',
    'Empire Marketing & Sales Pillar'
  ],
  diagnosticQuestions: [
    'How do we consistently generate new leads? Multiple reliable channels or just word-of-mouth?',
    'What\'s our value proposition or Grand Slam Offer? Why do customers choose us?',
    'Do we know our CAC and LTV? Are we profitable per customer?',
    'Is there a defined sales funnel with conversion rates at each step?'
  ],
  scoringCriteria: {
    high: 'At least one scalable acquisition channel; compelling offer; LTV:CAC >= 3:1; metrics tracked (+20)',
    partial: 'Some marketing efforts but inconsistent; good sales but unknown CAC/LTV (+10)',
    low: 'Growth unsystematic or stagnant; reliant on single client/channel; unit economics unknown (0)'
  },
  flags: [
    { description: 'Single big client or channel dependency', severity: 'critical' },
    { description: 'Unknown unit economics - flying blind on profitability', severity: 'critical' },
    { description: 'Low win rate or high churn', severity: 'warning' },
    { description: 'Weak offer - undifferentiated or underpriced', severity: 'warning' },
    { description: 'No marketing calendar - campaigns happen sporadically', severity: 'warning' }
  ],
  commonMistakes: [
    {
      mistake: 'Chasing every channel',
      diagnostic: 'Company lists 5+ lead sources but none produce reliably'
    },
    {
      mistake: 'Underestimating CAC',
      diagnostic: 'Don\'t know the cost of last 10 customers'
    },
    {
      mistake: 'Field of Dreams marketing',
      diagnostic: 'New business comes only via random referrals, no marketing budget'
    },
    {
      mistake: 'Over-reliance on founder for sales',
      diagnostic: 'No one else can sell or service key clients'
    }
  ]
}

/**
 * Finance Engine - Numbers & Cash
 * Financial visibility, profitability, cash flow, unit economics
 */
export const FINANCE_ENGINE: EngineDefinition = {
  id: 'finance',
  name: 'finance',
  displayName: 'Finance',
  description: 'Numbers & Cash - Financial visibility, profitability, cash flow, controls',
  frameworkSources: [
    'EOS Data Component - Scorecards with weekly metrics',
    'Empire Finance Pillar - Clean books, real-time dashboard',
    'Apex emphasis on unit economics and cash runway'
  ],
  diagnosticQuestions: [
    'Are our financials up to date and accurate? Do we review a scorecard weekly?',
    'Are we profitable and do we know our gross margin on each product/service?',
    'Do we have sufficient cash runway (3-6 months reserves)?',
    'Do we know our unit economics (CAC, LTV, cost of delivery)?',
    'Who is accountable for financial management?'
  ],
  scoringCriteria: {
    high: 'Full financial control; weekly dashboard; cash runway >3 months; unit economics positive (+20)',
    partial: 'Financials exist but gaps - quarterly reviews only; decent profit but no forecasting (+10)',
    low: 'Poor financial grip; books disorganized; paycheck-to-paycheck without budgeting (0)'
  },
  flags: [
    { description: 'No weekly or monthly financial review', severity: 'critical' },
    { description: 'High debt or thin margins with no plan', severity: 'critical' },
    { description: 'Mixing personal and business finances', severity: 'warning' },
    { description: 'Ignoring unit economics - selling without knowing profitability', severity: 'warning' },
    { description: 'Tax or compliance issues pending', severity: 'critical' }
  ],
  commonMistakes: [
    {
      mistake: 'Revenue ≠ Profit focus',
      diagnostic: 'Celebrating top-line growth without monitoring bottom line'
    },
    {
      mistake: 'Out-of-date books',
      diagnostic: 'Last financial statements from over 60 days ago'
    },
    {
      mistake: 'Overoptimistic projections',
      diagnostic: 'Spending today expecting tomorrow\'s revenue'
    },
    {
      mistake: 'No KPI ownership',
      diagnostic: 'Leadership cannot explain basic financial metrics without calling accountant'
    }
  ]
}

/** All engines as an indexed object */
export const ENGINES: Record<FrameworkEngineName, EngineDefinition> = {
  vision: VISION_ENGINE,
  people: PEOPLE_ENGINE,
  operations: OPERATIONS_ENGINE,
  revenue: REVENUE_ENGINE,
  finance: FINANCE_ENGINE
}

/** Ordered list of engine names */
export const ENGINE_ORDER: FrameworkEngineName[] = ['vision', 'people', 'operations', 'revenue', 'finance']
