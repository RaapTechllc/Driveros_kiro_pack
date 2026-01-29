/**
 * DriverOS Action Templates
 *
 * Templates for generating recommended actions based on engine weaknesses.
 * Actions are specific, actionable, and tailored to the diagnosed findings.
 */

import type { FrameworkEngineName, ActionOwner, EffortLevel, ActionPriority } from '../types'

export interface ActionTemplate {
  id: string
  title: string
  description: string
  engine: FrameworkEngineName
  triggerCondition: 'weak_engine' | 'critical_flag' | 'warning_flag' | 'question_weak'
  questionId?: number // If triggered by specific question
  defaultOwner: ActionOwner
  ownerForSmallBusiness: ActionOwner
  effort: EffortLevel
  defaultPriority: ActionPriority
  rationale: string
}

/** Effort level descriptions */
export const EFFORT_DESCRIPTIONS: Record<EffortLevel, string> = {
  1: 'Trivial (<1 hour)',
  2: 'Small (a few hours)',
  3: 'Medium (1-2 days)',
  4: 'Large (about a week)',
  5: 'Major (multiple weeks)'
}

// ============================================================================
// Vision Engine Actions
// ============================================================================

export const VISION_ACTIONS: ActionTemplate[] = [
  {
    id: 'vision-1',
    title: 'Document Your Vision Story',
    description: 'Write a one-page vision document covering your 3-year target, core purpose, and core values. Share with the entire team.',
    engine: 'vision',
    triggerCondition: 'weak_engine',
    defaultOwner: 'CEO',
    ownerForSmallBusiness: 'CEO',
    effort: 2,
    defaultPriority: 'do_now',
    rationale: 'A documented vision aligns the team and prevents everyone from rowing in different directions'
  },
  {
    id: 'vision-2',
    title: 'Implement 90-Day Rocks',
    description: 'Set 3-7 clear quarterly priorities (Rocks) and communicate them in an all-hands meeting. Post the #1 goal visibly.',
    engine: 'vision',
    triggerCondition: 'question_weak',
    questionId: 5,
    defaultOwner: 'CEO',
    ownerForSmallBusiness: 'CEO',
    effort: 2,
    defaultPriority: 'do_now',
    rationale: 'If team members can\'t articulate the priority, they can\'t work toward it'
  },
  {
    id: 'vision-3',
    title: 'Align Strategy to Current Gear',
    description: 'Review your strategy against your current gear/phase. Ensure goals match your business maturity (don\'t chase scale goals in survival stage).',
    engine: 'vision',
    triggerCondition: 'warning_flag',
    defaultOwner: 'CEO',
    ownerForSmallBusiness: 'CEO',
    effort: 2,
    defaultPriority: 'do_next',
    rationale: 'Misaligned strategy wastes resources and creates frustration'
  }
]

// ============================================================================
// People Engine Actions
// ============================================================================

export const PEOPLE_ACTIONS: ActionTemplate[] = [
  {
    id: 'people-1',
    title: 'Create an Accountability Chart',
    description: 'Map every key function to a single owner. Use EOS Accountability Chart format: every seat has one person, every person has clear seats.',
    engine: 'people',
    triggerCondition: 'weak_engine',
    defaultOwner: 'COO',
    ownerForSmallBusiness: 'CEO',
    effort: 3,
    defaultPriority: 'do_now',
    rationale: 'Undefined roles lead to dropped balls and finger-pointing'
  },
  {
    id: 'people-2',
    title: 'Identify and Empower a Second-in-Command',
    description: 'Designate someone who can make decisions in your absence. Document the decisions they can make and establish a weekly sync.',
    engine: 'people',
    triggerCondition: 'question_weak',
    questionId: 2,
    defaultOwner: 'CEO',
    ownerForSmallBusiness: 'CEO',
    effort: 3,
    defaultPriority: 'do_now',
    rationale: 'If the CEO is a single point of failure, the business cannot grow or survive emergencies'
  },
  {
    id: 'people-3',
    title: 'Run a People Analyzer',
    description: 'For each team member, assess: Do they Get it, Want it, and have Capacity (GWC)? Do they fit core values? Address mismatches.',
    engine: 'people',
    triggerCondition: 'warning_flag',
    defaultOwner: 'HR',
    ownerForSmallBusiness: 'CEO',
    effort: 3,
    defaultPriority: 'do_next',
    rationale: 'Wrong people in seats create drag on the entire organization'
  },
  {
    id: 'people-4',
    title: 'Cross-Train Key Roles',
    description: 'For each critical function, ensure at least one backup person can cover. Create simple procedure docs and practice handoffs.',
    engine: 'people',
    triggerCondition: 'question_weak',
    questionId: 2,
    defaultOwner: 'Operations',
    ownerForSmallBusiness: 'CEO',
    effort: 4,
    defaultPriority: 'do_next',
    rationale: 'Single-point expertise bottlenecks scaling and creates vacation-proof problems'
  }
]

// ============================================================================
// Operations Engine Actions
// ============================================================================

export const OPERATIONS_ACTIONS: ActionTemplate[] = [
  {
    id: 'ops-1',
    title: 'Identify Your Brick Metric',
    description: 'Determine the single most important leading indicator for your business. Track it daily and review in a 5-minute morning huddle.',
    engine: 'operations',
    triggerCondition: 'question_weak',
    questionId: 1,
    defaultOwner: 'CEO',
    ownerForSmallBusiness: 'CEO',
    effort: 2,
    defaultPriority: 'do_now',
    rationale: 'Without a daily leading indicator, you\'re driving blind and reacting to lagging results'
  },
  {
    id: 'ops-2',
    title: 'Establish a Weekly L10 Meeting',
    description: 'Implement a structured weekly leadership meeting (Level 10): review scorecard, Rock progress, solve top 3 issues using IDS.',
    engine: 'operations',
    triggerCondition: 'weak_engine',
    defaultOwner: 'CEO',
    ownerForSmallBusiness: 'CEO',
    effort: 2,
    defaultPriority: 'do_now',
    rationale: 'A consistent meeting cadence ensures issues get identified and resolved weekly'
  },
  {
    id: 'ops-3',
    title: 'Document Core Processes',
    description: 'Create simple 1-page SOPs for your 5-6 core processes: sales, fulfillment, hiring, finance, customer service. Use the "20% that gives 80%" approach.',
    engine: 'operations',
    triggerCondition: 'question_weak',
    questionId: 4,
    defaultOwner: 'Operations',
    ownerForSmallBusiness: 'CEO',
    effort: 4,
    defaultPriority: 'do_now',
    rationale: 'If it\'s all in your head, the business can\'t scale or run without you'
  },
  {
    id: 'ops-4',
    title: 'Build a Weekly Scorecard',
    description: 'Create a one-page scorecard with 5-15 key metrics covering each department. Review weekly to spot trends before they become problems.',
    engine: 'operations',
    triggerCondition: 'critical_flag',
    defaultOwner: 'COO',
    ownerForSmallBusiness: 'CEO',
    effort: 3,
    defaultPriority: 'do_now',
    rationale: 'Data-driven decisions beat gut feelings; a scorecard gives you at-a-glance health'
  }
]

// ============================================================================
// Revenue Engine Actions
// ============================================================================

export const REVENUE_ACTIONS: ActionTemplate[] = [
  {
    id: 'revenue-1',
    title: 'Calculate Your CAC and LTV',
    description: 'Track total marketing/sales spend over 90 days. Divide by customers acquired = CAC. Calculate average revenue per customer over lifetime = LTV.',
    engine: 'revenue',
    triggerCondition: 'question_weak',
    questionId: 3,
    defaultOwner: 'Sales',
    ownerForSmallBusiness: 'CEO',
    effort: 3,
    defaultPriority: 'do_now',
    rationale: 'Unknown unit economics means you might be losing money with every sale'
  },
  {
    id: 'revenue-2',
    title: 'Define Your Core Lead Channel',
    description: 'Pick ONE lead generation channel (outbound, content, paid, referrals) and master it before adding others. Track leads and conversions weekly.',
    engine: 'revenue',
    triggerCondition: 'weak_engine',
    defaultOwner: 'Sales',
    ownerForSmallBusiness: 'CEO',
    effort: 3,
    defaultPriority: 'do_now',
    rationale: 'Spreading thin across channels means mastering none; focus creates results'
  },
  {
    id: 'revenue-3',
    title: 'Document Your Sales Process',
    description: 'Map every step from lead to close. Define conversion rate targets for each step. Train team on the process.',
    engine: 'revenue',
    triggerCondition: 'warning_flag',
    defaultOwner: 'Sales',
    ownerForSmallBusiness: 'CEO',
    effort: 3,
    defaultPriority: 'do_next',
    rationale: 'An undefined sales process means inconsistent results and founder dependency'
  },
  {
    id: 'revenue-4',
    title: 'Diversify Revenue Sources',
    description: 'If >50% revenue comes from one client or channel, develop a plan to add a second significant source within 90 days.',
    engine: 'revenue',
    triggerCondition: 'critical_flag',
    defaultOwner: 'CEO',
    ownerForSmallBusiness: 'CEO',
    effort: 4,
    defaultPriority: 'do_now',
    rationale: 'Single-source dependency is an existential risk; diversification provides stability'
  }
]

// ============================================================================
// Finance Engine Actions
// ============================================================================

export const FINANCE_ACTIONS: ActionTemplate[] = [
  {
    id: 'finance-1',
    title: 'Establish Weekly Financial Review',
    description: 'Set a 30-minute weekly slot to review: cash balance, AR/AP, weekly sales, and top 3 expenses. Use a simple dashboard or spreadsheet.',
    engine: 'finance',
    triggerCondition: 'weak_engine',
    defaultOwner: 'Finance',
    ownerForSmallBusiness: 'CEO',
    effort: 2,
    defaultPriority: 'do_now',
    rationale: 'Without regular financial review, crises emerge without warning'
  },
  {
    id: 'finance-2',
    title: 'Build a Cash Runway Forecast',
    description: 'Calculate your monthly burn rate and current cash. Ensure you have 3+ months runway. If not, create a plan to improve cash position.',
    engine: 'finance',
    triggerCondition: 'critical_flag',
    defaultOwner: 'Finance',
    ownerForSmallBusiness: 'CEO',
    effort: 2,
    defaultPriority: 'do_now',
    rationale: 'Cash is oxygen; running out kills businesses faster than anything'
  },
  {
    id: 'finance-3',
    title: 'Track Unit Economics',
    description: 'For each product/service, calculate: cost of delivery, gross margin, and contribution to profit. Know which offerings make money.',
    engine: 'finance',
    triggerCondition: 'question_weak',
    questionId: 3,
    defaultOwner: 'Finance',
    ownerForSmallBusiness: 'CEO',
    effort: 3,
    defaultPriority: 'do_now',
    rationale: 'Selling unprofitable products faster just accelerates losses'
  },
  {
    id: 'finance-4',
    title: 'Separate Business and Personal Finances',
    description: 'Open a dedicated business bank account. Establish a regular owner draw instead of ad-hoc withdrawals. Clean up commingled transactions.',
    engine: 'finance',
    triggerCondition: 'warning_flag',
    defaultOwner: 'CEO',
    ownerForSmallBusiness: 'CEO',
    effort: 2,
    defaultPriority: 'do_now',
    rationale: 'Mixed finances create tax headaches and obscure true business health'
  },
  {
    id: 'finance-5',
    title: 'Close Books Monthly',
    description: 'Establish a monthly close process: reconcile accounts, review P&L and balance sheet, compare to budget. Do this by the 15th of following month.',
    engine: 'finance',
    triggerCondition: 'warning_flag',
    defaultOwner: 'Finance',
    ownerForSmallBusiness: 'CEO',
    effort: 3,
    defaultPriority: 'do_next',
    rationale: 'Stale financials mean you\'re making decisions with an old map'
  }
]

/** All action templates by engine */
export const ACTION_TEMPLATES_BY_ENGINE: Record<FrameworkEngineName, ActionTemplate[]> = {
  vision: VISION_ACTIONS,
  people: PEOPLE_ACTIONS,
  operations: OPERATIONS_ACTIONS,
  revenue: REVENUE_ACTIONS,
  finance: FINANCE_ACTIONS
}

/** All action templates flat list */
export const ALL_ACTION_TEMPLATES: ActionTemplate[] = [
  ...VISION_ACTIONS,
  ...PEOPLE_ACTIONS,
  ...OPERATIONS_ACTIONS,
  ...REVENUE_ACTIONS,
  ...FINANCE_ACTIONS
]

/**
 * Get action templates for a specific engine
 */
export function getTemplatesForEngine(engine: FrameworkEngineName): ActionTemplate[] {
  return ACTION_TEMPLATES_BY_ENGINE[engine] || []
}

/**
 * Get action templates triggered by a specific question
 */
export function getTemplatesForQuestion(questionId: number): ActionTemplate[] {
  return ALL_ACTION_TEMPLATES.filter(t => t.questionId === questionId)
}

/**
 * Determine the appropriate owner based on business size
 */
export function determineOwner(template: ActionTemplate, isSmallBusiness: boolean): ActionOwner {
  return isSmallBusiness ? template.ownerForSmallBusiness : template.defaultOwner
}
