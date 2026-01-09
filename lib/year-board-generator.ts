import { YearItem, YearPlan } from './year-board-types'
import { createYearPlan, createYearItem, saveYearPlan, saveYearItems } from './year-board-storage'

/**
 * Year Board Plan Generator
 * 
 * AI-first generation of annual business plans following Jesse Itzler methodology.
 * Generates a complete year plan with:
 * - 3-6 milestones (checkpoints tied to North Star)
 * - 6 plays (initiatives distributed across quarters/departments)
 * - 4 rituals (one operating habit per quarter)
 * - 4 tune-ups (planning/review sessions per quarter)
 * 
 * All items are automatically aligned to North Star when provided.
 * 
 * @see .kiro/steering/year-board.md for constraints and alignment rules
 */

// Year plan generation templates
const MILESTONE_TEMPLATES = [
  { title: 'Q1 Revenue Milestone', rationale: 'Track progress toward annual revenue goal.', quarter: 1 },
  { title: 'Mid-Year Review', rationale: 'Assess progress and adjust strategy.', quarter: 2 },
  { title: 'Q3 Growth Milestone', rationale: 'Validate scaling initiatives are working.', quarter: 3 },
  { title: 'Year-End Target', rationale: 'Achieve North Star goal by December.', quarter: 4 },
  { title: 'Product Launch', rationale: 'Deliver key product milestone.', quarter: 2 },
  { title: 'Market Expansion', rationale: 'Enter new market or segment.', quarter: 3 }
]

const PLAY_TEMPLATES = [
  { title: 'Customer Acquisition Campaign', rationale: 'Drive new customer growth.', department: 'sales_marketing' },
  { title: 'Process Optimization Initiative', rationale: 'Improve operational efficiency.', department: 'ops' },
  { title: 'Cost Reduction Program', rationale: 'Optimize expenses and improve margins.', department: 'finance' },
  { title: 'Team Expansion Plan', rationale: 'Scale team to support growth.', department: 'ops' },
  { title: 'Technology Upgrade', rationale: 'Modernize systems for scalability.', department: 'ops' },
  { title: 'Brand Awareness Campaign', rationale: 'Increase market visibility.', department: 'sales_marketing' },
  { title: 'Partnership Development', rationale: 'Build strategic alliances.', department: 'sales_marketing' },
  { title: 'Financial Controls Implementation', rationale: 'Strengthen financial management.', department: 'finance' }
]

const RITUAL_TEMPLATES = [
  { title: 'Quarterly Business Review', rationale: 'Assess performance and plan next quarter.' },
  { title: 'Monthly All-Hands Meeting', rationale: 'Keep team aligned and informed.' },
  { title: 'Weekly Leadership Sync', rationale: 'Coordinate leadership decisions.' },
  { title: 'Customer Feedback Review', rationale: 'Stay connected to customer needs.' }
]

const TUNEUP_TEMPLATES = [
  { title: 'Q1 Strategy Session', rationale: 'Set direction for the year.' },
  { title: 'Mid-Year Planning Retreat', rationale: 'Adjust strategy based on learnings.' },
  { title: 'Q3 Performance Review', rationale: 'Evaluate team and process performance.' },
  { title: 'Year-End Retrospective', rationale: 'Learn from the year and plan ahead.' }
]

/**
 * Generates a complete year plan with milestones, plays, rituals, and tune-ups.
 * 
 * @param northStarGoalId - Optional ID to link all items to North Star goal
 * @returns Object containing the plan metadata and array of year items
 * 
 * @example
 * const { plan, items } = generateYearPlan('goal-123')
 * // items will have alignment_status: 'linked' and linked_goal_id: 'goal-123'
 */
export function generateYearPlan(northStarGoalId?: string): { plan: YearPlan, items: YearItem[] } {
  const plan = createYearPlan(northStarGoalId)
  const items: YearItem[] = []

  // Generate 3-6 milestones (Company lane)
  const milestoneCount = Math.floor(Math.random() * 4) + 3 // 3-6
  const selectedMilestones = shuffleArray([...MILESTONE_TEMPLATES]).slice(0, milestoneCount)
  
  selectedMilestones.forEach(template => {
    const item = createYearItem(
      'milestone',
      template.title,
      'company',
      template.quarter as YearItem['quarter'],
      template.rationale,
      plan.id
    )
    items.push(item)
  })

  // Generate exactly 6 plays distributed across quarters and departments
  const selectedPlays = shuffleArray([...PLAY_TEMPLATES]).slice(0, 6)
  const quarters: YearItem['quarter'][] = [1, 2, 3, 4]
  
  selectedPlays.forEach((template, index) => {
    const quarter = quarters[index % 4] // Distribute across quarters
    const item = createYearItem(
      'play',
      template.title,
      template.department as YearItem['department'],
      quarter,
      template.rationale,
      plan.id
    )
    items.push(item)
  })

  // Generate exactly 4 rituals (one per quarter)
  const selectedRituals = shuffleArray([...RITUAL_TEMPLATES]).slice(0, 4)
  
  selectedRituals.forEach((template, index) => {
    const quarter = (index + 1) as YearItem['quarter'] // Q1, Q2, Q3, Q4
    const departments: YearItem['department'][] = ['ops', 'sales_marketing', 'finance']
    const department = departments[index % 3] // Distribute across departments
    
    const item = createYearItem(
      'ritual',
      template.title,
      department,
      quarter,
      template.rationale,
      plan.id
    )
    items.push(item)
  })

  // Generate 4 tune-ups (one per quarter) - optional
  selectedRituals.forEach((template, index) => {
    const quarter = (index + 1) as YearItem['quarter']
    const tuneupTemplate = TUNEUP_TEMPLATES[index]
    
    if (tuneupTemplate) {
      const item = createYearItem(
        'tuneup',
        tuneupTemplate.title,
        'company',
        quarter,
        tuneupTemplate.rationale,
        plan.id
      )
      items.push(item)
    }
  })

  // Set alignment status based on North Star presence
  const alignmentStatus = northStarGoalId ? 'linked' : 'unlinked'
  items.forEach(item => {
    item.alignment_status = alignmentStatus
    if (northStarGoalId) {
      item.linked_goal_id = northStarGoalId
    }
  })

  return { plan, items }
}

// Save generated plan to storage
export function saveGeneratedPlan(northStarGoalId?: string): void {
  const { plan, items } = generateYearPlan(northStarGoalId)
  
  saveYearPlan(plan)
  saveYearItems(items, plan.year)
}

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Get plan statistics
export function getPlanStats(items: YearItem[]): {
  milestones: number
  plays: number
  rituals: number
  tuneups: number
  linked: number
  unlinked: number
} {
  return {
    milestones: items.filter(item => item.type === 'milestone').length,
    plays: items.filter(item => item.type === 'play').length,
    rituals: items.filter(item => item.type === 'ritual').length,
    tuneups: items.filter(item => item.type === 'tuneup').length,
    linked: items.filter(item => item.alignment_status === 'linked').length,
    unlinked: items.filter(item => item.alignment_status === 'unlinked').length
  }
}
