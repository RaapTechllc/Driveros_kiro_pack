import { FlashScanData, FlashScanResult, QuickWin, VALID_ROLES, type OwnerRole } from './types'
import { performanceMonitor } from './performance-monitor'
import { getIndustryProfile, getConstraintSolutions, getPhaseRecommendations } from './industry-knowledge'

/**
 * Flash Scan Analysis Engine
 * 
 * Provides instant business analysis in under 5 minutes.
 * Uses heuristics based on industry, size, and constraints to generate:
 * - Weekly Accelerator KPI recommendation
 * - 3-5 actionable quick wins with owners
 * - Gear estimate (business phase 1-5)
 * 
 * @see .kiro/steering/scoring.md for confidence and quick win rules
 */

/**
 * Type guard to check if a string is a valid OwnerRole
 * @param role - The role string to validate
 * @returns True if role is valid, false otherwise
 */
function isValidOwnerRole(role: string): role is OwnerRole {
  return VALID_ROLES.includes(role as OwnerRole)
}

/**
 * Converts a string to OwnerRole with fallback
 * @param role - The role string from user input
 * @returns Valid OwnerRole or 'Owner' as default
 */
function toOwnerRole(role: string): OwnerRole {
  if (isValidOwnerRole(role)) {
    return role
  }

  // Fallback logic for common variations
  const normalized = role.toLowerCase().trim()
  if (normalized === 'owner' || normalized === 'ceo' || normalized === 'founder') {
    return 'Owner'
  }
  if (normalized === 'operations' || normalized === 'ops') {
    return 'Ops'
  }
  if (normalized === 'sales' || normalized === 'revenue') {
    return 'Sales'
  }
  if (normalized === 'finance' || normalized === 'cfo') {
    return 'Finance'
  }

  // Default fallback
  console.warn(`Unknown role "${role}", defaulting to Owner`)
  return 'Owner'
}

// Industry-based accelerator mapping
const ACCELERATOR_MAP: Record<string, string> = {
  'Tech': 'Weekly Active Users',
  'Technology': 'Weekly Active Users',
  'Healthcare': 'Patient Satisfaction Score',
  'Finance': 'Client Acquisition Rate',
  'Retail': 'Sales Conversion Rate',
  'Manufacturing': 'Production Efficiency',
  'Other': 'Revenue Growth Rate'
}

// Constraint-based quick wins templates
const QUICK_WINS_TEMPLATES: Record<string, QuickWin[]> = {
  'cash': [
    { title: 'Set weekly cash collection target', why: 'Improves cash flow predictability', owner_role: 'Finance', eta_days: 3, engine: 'Finance' },
    { title: 'Review top 5 overdue invoices', why: 'Accelerates receivables collection', owner_role: 'Finance', eta_days: 1, engine: 'Finance' },
    { title: 'Cut lowest ROI expense this week', why: 'Preserves cash runway', owner_role: 'Owner', eta_days: 2, engine: 'Finance' }
  ],
  'capacity': [
    { title: 'Set WIP limit for active projects', why: 'Prevents work bottlenecks', owner_role: 'Ops', eta_days: 1, engine: 'Operations' },
    { title: 'Assign single owner per project', why: 'Eliminates accountability gaps', owner_role: 'Owner', eta_days: 2, engine: 'Leadership' },
    { title: 'Schedule 15-min daily standups', why: 'Surfaces blockers faster', owner_role: 'Ops', eta_days: 1, engine: 'Operations' }
  ],
  'demand': [
    { title: 'Track weekly qualified leads', why: 'Measures pipeline health', owner_role: 'Sales', eta_days: 2, engine: 'Marketing & Sales' },
    { title: 'Call top 3 lost prospects', why: 'Identifies conversion gaps', owner_role: 'Sales', eta_days: 3, engine: 'Marketing & Sales' },
    { title: 'Set one weekly marketing test', why: 'Improves lead generation', owner_role: 'Sales', eta_days: 5, engine: 'Marketing & Sales' }
  ],
  'delivery': [
    { title: 'Measure on-time delivery rate', why: 'Tracks customer satisfaction', owner_role: 'Ops', eta_days: 2, engine: 'Operations' },
    { title: 'Identify top delivery blocker', why: 'Removes process friction', owner_role: 'Ops', eta_days: 1, engine: 'Operations' },
    { title: 'Set quality checkpoint', why: 'Prevents rework cycles', owner_role: 'Ops', eta_days: 3, engine: 'Operations' }
  ],
  'people': [
    { title: 'Schedule 1-on-1s with key team', why: 'Prevents talent loss', owner_role: 'Owner', eta_days: 5, engine: 'Personnel' },
    { title: 'Document critical processes', why: 'Reduces key person risk', owner_role: 'Ops', eta_days: 7, engine: 'Personnel' },
    { title: 'Set hiring pipeline target', why: 'Addresses capacity gaps', owner_role: 'Owner', eta_days: 3, engine: 'Personnel' }
  ]
}

// Size-based gear estimation
function estimateGear(sizeband: string, constraint: string): { number: number, label: string, reason: string } {
  const gearLabels = ['', 'Idle', 'Grip', 'Drive', 'Overdrive', 'Apex']
  
  // Simple heuristic based on size and constraint
  let gear = 2 // Default to Grip
  
  if (sizeband === '1-10') gear = constraint === 'cash' ? 1 : 2
  else if (sizeband === '11-50') gear = 3
  else if (sizeband === '51-200') gear = 4
  else if (sizeband === '201+') gear = 5
  
  const reasons = {
    1: 'Need basic systems before scaling',
    2: 'Building foundation and early traction', 
    3: 'Growing with operational focus',
    4: 'Scaling systems and processes',
    5: 'Optimizing at scale'
  }
  
  return {
    number: gear,
    label: gearLabels[gear],
    reason: reasons[gear as keyof typeof reasons]
  }
}

/**
 * Analyzes Flash Scan input and generates instant recommendations.
 * 
 * @param data - User input from Flash Scan form (industry, size, role, north star, constraint)
 * @returns FlashScanResult with accelerator KPI, quick wins, and gear estimate
 * 
 * @example
 * const result = analyzeFlashScan({
 *   industry: 'Tech',
 *   size_band: '11-50',
 *   role: 'CEO',
 *   north_star: 'Hit $2M ARR by Dec 31',
 *   top_constraint: 'cash'
 * })
 */
export function analyzeFlashScan(data: FlashScanData): FlashScanResult {
  return performanceMonitor.trackSync('flash-scan-analysis', () => {
    // Get industry profile for enhanced insights
    const industryProfile = getIndustryProfile(data.industry)
    const constraintSolution = getConstraintSolutions(data.top_constraint.toLowerCase())
    
    // Get accelerator recommendation (industry-specific if available)
    let accelerator_kpi = ACCELERATOR_MAP[data.industry] || ACCELERATOR_MAP['Other']
    let accelerator_notes = `Based on ${data.industry} industry focus`
    
    if (industryProfile) {
      // Use industry-specific brick metric
      accelerator_kpi = industryProfile.brickMetrics[0]
      const phaseRec = getPhaseRecommendations(industryProfile.typicalPhase)
      accelerator_notes = `${industryProfile.name} in ${industryProfile.typicalPhase} phase. Focus: ${phaseRec.focus}`
    }
    
    // Get quick wins based on constraint
    const constraint_key = data.top_constraint.toLowerCase()
    let quick_wins = QUICK_WINS_TEMPLATES['capacity'] // Default
    
    for (const [key, wins] of Object.entries(QUICK_WINS_TEMPLATES)) {
      if (constraint_key.includes(key)) {
        quick_wins = wins
        break
      }
    }
    
    // Add role-specific win
    const role_win: QuickWin = {
      title: 'Pick one weekly Accelerator metric',
      why: 'Focuses team on single outcome',
      owner_role: toOwnerRole(data.role),
      eta_days: 1,
      engine: 'Leadership'
    }
    
    // Add industry-specific win if available
    const industry_wins: QuickWin[] = []
    if (industryProfile && industryProfile.accelerationActions.length > 0) {
      industry_wins.push({
        title: industryProfile.accelerationActions[0],
        why: `Top action for ${industryProfile.name} businesses`,
        owner_role: toOwnerRole(data.role),
        eta_days: 7,
        engine: 'Operations'
      })
    }
    
    // Add constraint-specific insight
    const constraint_win: QuickWin = {
      title: constraintSolution.thirtyDayFix.split('.')[0],
      why: `Root cause: ${constraintSolution.rootCause.split(' ').slice(0, 6).join(' ')}...`,
      owner_role: 'Owner',
      eta_days: 7,
      engine: 'Operations'
    }
    
    // Calculate confidence (higher with industry match)
    const confidence = industryProfile ? 0.92 : (data.north_star.length > 10 ? 0.85 : 0.65)
    
    return {
      schema_version: '1.0',
      confidence_score: confidence,
      accelerator: {
        kpi: accelerator_kpi,
        cadence: 'weekly',
        recommended: true,
        notes: accelerator_notes
      },
      quick_wins: [role_win, ...industry_wins, constraint_win, ...quick_wins.slice(0, 2)].slice(0, 5),
      gear_estimate: estimateGear(data.size_band, data.top_constraint),
      // Enhanced insights from knowledge base
      industry_insights: industryProfile ? {
        phase: industryProfile.typicalPhase,
        ltvCacTarget: industryProfile.ltvCacTarget,
        topConstraints: industryProfile.commonConstraints.slice(0, 3),
        leadGenPriority: industryProfile.leadGenPriority[0]
      } : undefined
    }
  }, { inputSize: Object.keys(data).length }) as FlashScanResult
}
