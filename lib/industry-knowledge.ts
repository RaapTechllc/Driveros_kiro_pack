/**
 * Industry Knowledge Base
 * 
 * Provides industry-specific insights for Flash Scan and Full Audit.
 * Each profile includes phase, LTV:CAC targets, constraints, and accelerators.
 */

export interface IndustryProfile {
  id: string
  name: string
  typicalPhase: 'Genesis' | 'Momentum' | 'Velocity' | 'Mastery' | 'Legacy'
  ltvCacTarget: { min: number; ideal: number }
  commonConstraints: string[]
  leadGenPriority: ('warm' | 'content' | 'cold' | 'paid')[]
  brickMetrics: string[]
  accelerationActions: string[]
}

export const INDUSTRY_PROFILES: Record<string, IndustryProfile> = {
  'Technology': {
    id: 'tech',
    name: 'Technology/SaaS',
    typicalPhase: 'Velocity',
    ltvCacTarget: { min: 3, ideal: 5 },
    commonConstraints: [
      'High churn in first 90 days',
      'Long sales cycles',
      'Feature creep over focus',
      'Scaling support with growth',
      'Developer dependency on founders'
    ],
    leadGenPriority: ['content', 'paid', 'cold', 'warm'],
    brickMetrics: [
      'Monthly Recurring Revenue (MRR)',
      'Net Revenue Retention',
      'Qualified demos booked',
      'Trial-to-paid conversion'
    ],
    accelerationActions: [
      'Implement 3-email onboarding sequence',
      'Add in-app activation checklist',
      'Create customer success playbook',
      'Build self-serve knowledge base',
      'Set up usage-based health scoring'
    ]
  },
  'Professional Services': {
    id: 'prof-services',
    name: 'Professional Services',
    typicalPhase: 'Momentum',
    ltvCacTarget: { min: 8, ideal: 15 },
    commonConstraints: [
      'Owner is the product',
      'Feast-or-famine revenue',
      'No documented processes',
      'Pricing based on time not value',
      'Referral-only lead generation'
    ],
    leadGenPriority: ['warm', 'content', 'cold', 'paid'],
    brickMetrics: [
      'Billable utilization rate',
      'Average project value',
      'Referrals per client',
      'Pipeline coverage ratio'
    ],
    accelerationActions: [
      'Document top 3 delivery processes',
      'Create fixed-price packages',
      'Build referral request system',
      'Hire first junior to delegate',
      'Set up monthly retainer offers'
    ]
  },
  'Healthcare': {
    id: 'healthcare',
    name: 'Healthcare Services',
    typicalPhase: 'Momentum',
    ltvCacTarget: { min: 5, ideal: 10 },
    commonConstraints: [
      'Compliance overhead',
      'Insurance reimbursement delays',
      'Staff turnover',
      'Patient no-shows',
      'Limited marketing options'
    ],
    leadGenPriority: ['warm', 'content', 'paid', 'cold'],
    brickMetrics: [
      'Patient visits per week',
      'Show rate percentage',
      'Revenue per visit',
      'New patient acquisition'
    ],
    accelerationActions: [
      'Implement appointment reminders',
      'Create patient referral program',
      'Optimize scheduling efficiency',
      'Build Google review system',
      'Add membership/subscription option'
    ]
  },
  'Home Services': {
    id: 'home-services',
    name: 'Home Services',
    typicalPhase: 'Genesis',
    ltvCacTarget: { min: 5, ideal: 8 },
    commonConstraints: [
      'Seasonal demand swings',
      'Technician recruitment',
      'Pricing inconsistency',
      'No repeat business system',
      'Owner on every job'
    ],
    leadGenPriority: ['paid', 'warm', 'content', 'cold'],
    brickMetrics: [
      'Jobs completed per week',
      'Average ticket size',
      'Repeat customer rate',
      'Lead-to-booking conversion'
    ],
    accelerationActions: [
      'Create maintenance agreement program',
      'Implement flat-rate pricing',
      'Build technician training system',
      'Set up automated follow-ups',
      'Launch Google Local Services ads'
    ]
  },
  'Retail': {
    id: 'retail',
    name: 'Retail',
    typicalPhase: 'Momentum',
    ltvCacTarget: { min: 3, ideal: 6 },
    commonConstraints: [
      'Inventory management',
      'Thin margins',
      'Seasonal cash flow',
      'Online competition',
      'Staff training consistency'
    ],
    leadGenPriority: ['paid', 'content', 'warm', 'cold'],
    brickMetrics: [
      'Revenue per square foot',
      'Inventory turnover',
      'Average transaction value',
      'Customer return rate'
    ],
    accelerationActions: [
      'Implement loyalty program',
      'Optimize inventory levels',
      'Train staff on upselling',
      'Build email/SMS list',
      'Create signature experience'
    ]
  },
  'Manufacturing': {
    id: 'manufacturing',
    name: 'Manufacturing',
    typicalPhase: 'Mastery',
    ltvCacTarget: { min: 4, ideal: 8 },
    commonConstraints: [
      'Long production cycles',
      'Quality control issues',
      'Supply chain dependencies',
      'Equipment maintenance',
      'Skilled labor shortage'
    ],
    leadGenPriority: ['warm', 'cold', 'content', 'paid'],
    brickMetrics: [
      'Units produced per week',
      'Defect rate',
      'On-time delivery rate',
      'Capacity utilization'
    ],
    accelerationActions: [
      'Implement lean manufacturing',
      'Create quality checkpoints',
      'Diversify supplier base',
      'Build preventive maintenance schedule',
      'Cross-train key positions'
    ]
  },
  'Real Estate': {
    id: 'real-estate',
    name: 'Real Estate',
    typicalPhase: 'Momentum',
    ltvCacTarget: { min: 10, ideal: 20 },
    commonConstraints: [
      'Market cycle dependency',
      'Lead quality issues',
      'Long transaction cycles',
      'Agent retention',
      'Personal brand vs company brand'
    ],
    leadGenPriority: ['warm', 'content', 'paid', 'cold'],
    brickMetrics: [
      'Listings taken per month',
      'Days on market',
      'Referral percentage',
      'Transaction volume'
    ],
    accelerationActions: [
      'Build sphere of influence system',
      'Create market update content',
      'Implement CRM follow-up sequences',
      'Develop team leverage model',
      'Launch past client nurture program'
    ]
  },
  'Food & Beverage': {
    id: 'food-bev',
    name: 'Food & Beverage',
    typicalPhase: 'Genesis',
    ltvCacTarget: { min: 3, ideal: 5 },
    commonConstraints: [
      'Thin margins',
      'Staff turnover',
      'Food cost control',
      'Inconsistent quality',
      'Location dependency'
    ],
    leadGenPriority: ['paid', 'content', 'warm', 'cold'],
    brickMetrics: [
      'Revenue per seat',
      'Food cost percentage',
      'Table turnover rate',
      'Online review rating'
    ],
    accelerationActions: [
      'Optimize menu for profitability',
      'Implement portion control',
      'Build online ordering system',
      'Create loyalty program',
      'Train staff on upselling'
    ]
  },
  'Education': {
    id: 'education',
    name: 'Education & Training',
    typicalPhase: 'Velocity',
    ltvCacTarget: { min: 4, ideal: 8 },
    commonConstraints: [
      'Course completion rates',
      'Content creation burden',
      'Student acquisition cost',
      'Pricing perception',
      'Scaling instructor time'
    ],
    leadGenPriority: ['content', 'paid', 'warm', 'cold'],
    brickMetrics: [
      'Enrollments per month',
      'Course completion rate',
      'Student satisfaction score',
      'Revenue per student'
    ],
    accelerationActions: [
      'Create signature course framework',
      'Build community component',
      'Implement progress tracking',
      'Add certification/credential',
      'Launch affiliate program'
    ]
  },
  'Financial Services': {
    id: 'financial',
    name: 'Financial Services',
    typicalPhase: 'Mastery',
    ltvCacTarget: { min: 10, ideal: 20 },
    commonConstraints: [
      'Compliance requirements',
      'Trust building time',
      'Commoditization pressure',
      'Client concentration risk',
      'Succession planning'
    ],
    leadGenPriority: ['warm', 'content', 'cold', 'paid'],
    brickMetrics: [
      'Assets under management',
      'Client retention rate',
      'Referrals per client',
      'Revenue per client'
    ],
    accelerationActions: [
      'Create client review cadence',
      'Build referral request system',
      'Develop niche specialization',
      'Implement client segmentation',
      'Add planning services tier'
    ]
  },
  'Creative Services': {
    id: 'creative',
    name: 'Creative Services',
    typicalPhase: 'Momentum',
    ltvCacTarget: { min: 6, ideal: 12 },
    commonConstraints: [
      'Scope creep',
      'Pricing by hour vs value',
      'Creative burnout',
      'Client dependency',
      'Portfolio vs production time'
    ],
    leadGenPriority: ['content', 'warm', 'cold', 'paid'],
    brickMetrics: [
      'Projects completed per month',
      'Average project value',
      'Client retention rate',
      'Proposal win rate'
    ],
    accelerationActions: [
      'Create productized service packages',
      'Build project scope templates',
      'Implement revision limits',
      'Develop case study system',
      'Add retainer offerings'
    ]
  },
  'Fitness': {
    id: 'fitness',
    name: 'Fitness & Wellness',
    typicalPhase: 'Genesis',
    ltvCacTarget: { min: 4, ideal: 8 },
    commonConstraints: [
      'Seasonal membership swings',
      'High member churn',
      'Trainer retention',
      'Space utilization',
      'Differentiation difficulty'
    ],
    leadGenPriority: ['paid', 'content', 'warm', 'cold'],
    brickMetrics: [
      'Member visits per week',
      'Member retention rate',
      'Revenue per member',
      'Class attendance rate'
    ],
    accelerationActions: [
      'Implement onboarding program',
      'Create accountability system',
      'Build community events',
      'Add nutrition/coaching upsell',
      'Launch referral incentive'
    ]
  }
}

/**
 * Get industry profile by name (fuzzy match)
 */
export function getIndustryProfile(industry: string): IndustryProfile | null {
  // Direct match
  if (INDUSTRY_PROFILES[industry]) {
    return INDUSTRY_PROFILES[industry]
  }
  
  // Fuzzy match
  const normalized = industry.toLowerCase()
  for (const [key, profile] of Object.entries(INDUSTRY_PROFILES)) {
    if (key.toLowerCase().includes(normalized) || 
        profile.name.toLowerCase().includes(normalized)) {
      return profile
    }
  }
  
  return null
}

/**
 * Get constraint solutions based on top constraint
 */
export function getConstraintSolutions(constraint: string): {
  rootCause: string
  thirtyDayFix: string
  metrics: string[]
} {
  const solutions: Record<string, { rootCause: string; thirtyDayFix: string; metrics: string[] }> = {
    'cash': {
      rootCause: 'Long receivables cycle or poor collection process',
      thirtyDayFix: 'Shorten payment terms to Net 15, implement automated follow-ups on Day 1, 7, 14. Offer 2% discount for immediate payment.',
      metrics: ['Days Sales Outstanding', 'Collection rate', 'Cash on hand']
    },
    'capacity': {
      rootCause: 'No systems to scale delivery beyond founder time',
      thirtyDayFix: 'Document your top 3 processes on video. Hire one person to handle 30% of delivery. Set WIP limits.',
      metrics: ['Jobs completed per week', 'Utilization rate', 'Backlog size']
    },
    'demand': {
      rootCause: 'No consistent lead generation system',
      thirtyDayFix: 'Pick ONE channel from Core Four (warm, content, cold, paid). Execute daily for 30 days. Track leads generated.',
      metrics: ['Leads per week', 'Lead-to-customer rate', 'Cost per lead']
    },
    'delivery': {
      rootCause: 'Inconsistent processes causing delays and quality issues',
      thirtyDayFix: 'Create delivery checklist for your core offering. Implement daily standup to catch blockers. Set clear SLAs.',
      metrics: ['On-time delivery rate', 'Customer satisfaction', 'Rework rate']
    },
    'people': {
      rootCause: 'No hiring system or training process',
      thirtyDayFix: 'Write job scorecard with measurable outcomes. Create 1-week onboarding checklist. Set 30/60/90 day milestones.',
      metrics: ['Time to productivity', 'Retention rate', 'Team satisfaction']
    }
  }
  
  return solutions[constraint] || solutions['demand']
}

/**
 * Get phase-specific recommendations
 */
export function getPhaseRecommendations(phase: IndustryProfile['typicalPhase']): {
  focus: string
  keyMetric: string
  topActions: string[]
} {
  const recommendations: Record<string, { focus: string; keyMetric: string; topActions: string[] }> = {
    'Genesis': {
      focus: 'Survival and product-market fit',
      keyMetric: 'Cash collected this week',
      topActions: [
        'Talk to 5 customers this week',
        'Get to cash flow positive',
        'Find your first repeatable sale'
      ]
    },
    'Momentum': {
      focus: 'Building systems for repeatability',
      keyMetric: 'Revenue growth rate',
      topActions: [
        'Document your core processes',
        'Hire your first key employee',
        'Create your first SOP'
      ]
    },
    'Velocity': {
      focus: 'Scaling through team and delegation',
      keyMetric: 'Revenue per employee',
      topActions: [
        'Build management layer',
        'Implement KPI dashboards',
        'Create training programs'
      ]
    },
    'Mastery': {
      focus: 'Optimization and efficiency',
      keyMetric: 'Profit margin',
      topActions: [
        'Optimize unit economics',
        'Automate repetitive tasks',
        'Focus on high-value activities'
      ]
    },
    'Legacy': {
      focus: 'Succession and continuity',
      keyMetric: 'Business value multiple',
      topActions: [
        'Document all tribal knowledge',
        'Develop successor candidates',
        'Clean up financials for exit'
      ]
    }
  }
  
  return recommendations[phase]
}
