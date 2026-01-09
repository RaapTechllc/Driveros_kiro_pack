import { FlashScanData } from './types'

/**
 * Full Audit Analysis Engine
 * 
 * Provides comprehensive business health assessment across 5 engines:
 * Leadership, Operations, Marketing & Sales, Finance, Personnel.
 * 
 * Scoring rules (from .kiro/steering/scoring.md):
 * - Completion gate: 70% of fields required before analysis
 * - Engine scores: 0-100 normalized from 1-5 inputs
 * - Status bands: green (≥70), yellow (40-69), red (<40)
 * - Gear mapping: Idle/Grip/Drive/Overdrive/Apex based on avg score
 * 
 * @see .kiro/steering/domain-model.md for output payload structure
 */

// Full Audit specific types
export interface FullAuditData extends FlashScanData {
  // Leadership Engine
  vision_clarity: number // 1-5 scale
  decision_speed: number // 1-5 scale
  team_alignment: number // 1-5 scale
  
  // Operations Engine  
  process_efficiency: number // 1-5 scale
  quality_control: number // 1-5 scale
  delivery_reliability: number // 1-5 scale
  
  // Marketing & Sales Engine
  lead_generation: number // 1-5 scale
  conversion_rate: number // 1-5 scale
  customer_retention: number // 1-5 scale
  
  // Finance Engine
  cash_flow_health: number // 1-5 scale
  profitability: number // 1-5 scale
  financial_planning: number // 1-5 scale
  
  // Personnel Engine
  team_satisfaction: number // 1-5 scale
  skill_gaps: number // 1-5 scale (inverted)
  retention_risk: number // 1-5 scale (inverted)
}

export interface EngineResult {
  name: string
  score: number // 0-100
  status: 'green' | 'yellow' | 'red'
  rationale: string
  next_action: string
}

export interface FullAuditResult {
  schema_version: string
  status: 'ok' | 'needs_more_data'
  mode: 'audit'
  completion_score: number
  company: {
    industry: string
    role: string
    size_band: string
  }
  gear: {
    number: number
    label: string
    reason: string
  }
  engines: EngineResult[]
  accelerator: {
    kpi: string
    cadence: 'weekly'
    recommended: boolean
    user_override_allowed: boolean
    notes: string
  }
  brakes: {
    risk_level: 'low' | 'medium' | 'high'
    flags: string[]
    controls: string[]
  }
  goals: {
    north_star: {
      title: string
      metric: string
      current: number | null
      target: number | null
      due_date: string | null
    }
    departments: Array<{
      department: 'Ops' | 'Sales/Marketing' | 'Finance'
      title: string
      metric: string
      current: number | null
      target: number | null
      due_date: string | null
      alignment_statement: string
    }>
  }
  actions: {
    do_now: Array<{
      title: string
      why: string
      owner_role: 'Owner' | 'Ops' | 'Sales' | 'Finance'
      eta_days: number
      engine: string
    }>
    do_next: Array<{
      title: string
      why: string
      owner_role: 'Owner' | 'Ops' | 'Sales' | 'Finance'
      eta_days: number
      engine: string
    }>
  }
  meetings: {
    warm_up: { duration_min: number; agenda: string[] }
    pit_stop: { duration_min: number; agenda: string[] }
    full_tune_up: { duration_min: number; agenda: string[] }
  }
  exports: {
    actions_csv_ready: boolean
    goals_csv_ready: boolean
  }
}

// Normalize 1-5 scale to 0-100
function normalize(value: number): number {
  return ((value - 1) / 4) * 100
}

// Calculate engine scores
function calculateEngineScores(data: FullAuditData): EngineResult[] {
  const engines = [
    {
      name: 'Leadership',
      inputs: [data.vision_clarity, data.decision_speed, data.team_alignment],
      actions: [
        'Set weekly leadership check-ins',
        'Document decision framework', 
        'Align team on quarterly goals'
      ]
    },
    {
      name: 'Operations',
      inputs: [data.process_efficiency, data.quality_control, data.delivery_reliability],
      actions: [
        'Map critical process bottlenecks',
        'Implement quality checkpoints',
        'Set delivery time targets'
      ]
    },
    {
      name: 'Marketing & Sales',
      inputs: [data.lead_generation, data.conversion_rate, data.customer_retention],
      actions: [
        'Track weekly lead metrics',
        'Optimize conversion funnel',
        'Survey at-risk customers'
      ]
    },
    {
      name: 'Finance',
      inputs: [data.cash_flow_health, data.profitability, data.financial_planning],
      actions: [
        'Set weekly cash targets',
        'Review profit margins',
        'Create 13-week cash forecast'
      ]
    },
    {
      name: 'Personnel',
      inputs: [data.team_satisfaction, 6 - data.skill_gaps, 6 - data.retention_risk], // Invert negative metrics
      actions: [
        'Schedule team 1-on-1s',
        'Identify critical skill gaps',
        'Create retention plan'
      ]
    }
  ]

  return engines.map((engine, index) => {
    const score = Math.round(engine.inputs.reduce((sum, val) => sum + normalize(val), 0) / engine.inputs.length)
    
    let status: 'green' | 'yellow' | 'red'
    if (score >= 70) status = 'green'
    else if (score >= 40) status = 'yellow'
    else status = 'red'

    const rationale = score < 40 
      ? `${engine.name} needs immediate attention with ${score}% health`
      : score < 70
      ? `${engine.name} shows gaps that need addressing`
      : `${engine.name} is performing well`

    return {
      name: engine.name,
      score,
      status,
      rationale,
      next_action: engine.actions[index % engine.actions.length]
    }
  })
}

// Calculate gear from engine average
function calculateGear(engines: EngineResult[]): { number: number, label: string, reason: string } {
  // Handle <3 engines case per scoring rules
  const knownEngines = engines.filter(e => e.score > 0)
  if (knownEngines.length < 3) {
    return {
      number: 2,
      label: 'Grip',
      reason: 'Need more inputs to size your phase'
    }
  }

  const avgScore = engines.reduce((sum, engine) => sum + engine.score, 0) / engines.length
  const gearLabels = ['', 'Idle', 'Grip', 'Drive', 'Overdrive', 'Apex']
  
  let gear: number
  if (avgScore < 40) gear = 1
  else if (avgScore < 55) gear = 2
  else if (avgScore < 70) gear = 3
  else if (avgScore < 85) gear = 4
  else gear = 5

  const reasons = {
    1: 'Multiple systems need foundational work',
    2: 'Building core capabilities across engines',
    3: 'Growing with operational focus needed',
    4: 'Scaling well with optimization opportunities',
    5: 'High performance across all engines'
  }

  return {
    number: gear,
    label: gearLabels[gear],
    reason: reasons[gear as keyof typeof reasons]
  }
}

// Assess risk level
function assessRisks(data: FullAuditData, engines: EngineResult[]): { risk_level: 'low' | 'medium' | 'high', flags: string[], controls: string[] } {
  const flags: string[] = []
  const controls: string[] = []
  
  // Check for red engines
  const redEngines = engines.filter(e => e.status === 'red')
  if (redEngines.length >= 2) {
    flags.push('Multiple critical engine failures')
    controls.push('Focus on top 2 engines only')
  }
  
  // Check cash flow
  if (data.cash_flow_health <= 2) {
    flags.push('Cash flow stress')
    controls.push('Weekly cash monitoring required')
  }
  
  // Check retention risk
  if (data.retention_risk >= 4) {
    flags.push('High talent loss risk')
    controls.push('Immediate retention plan needed')
  }

  const risk_level = flags.length >= 3 ? 'high' : flags.length > 0 ? 'medium' : 'low'
  
  return { risk_level, flags, controls }
}

/**
 * Analyzes Full Audit input and generates comprehensive business assessment.
 * 
 * @param data - Complete audit form data (15 engine fields + base Flash Scan fields)
 * @returns FullAuditResult with gear, 5 engines, actions, goals, and meeting templates
 * 
 * @throws Returns status: 'needs_more_data' if completion_score < 0.70
 */
export function analyzeFullAudit(data: FullAuditData): FullAuditResult {
  // Calculate completion score - only count numeric audit fields
  const auditFields = [
    'vision_clarity', 'decision_speed', 'team_alignment',
    'process_efficiency', 'quality_control', 'delivery_reliability', 
    'lead_generation', 'conversion_rate', 'customer_retention',
    'cash_flow_health', 'profitability', 'financial_planning',
    'team_satisfaction', 'skill_gaps', 'retention_risk'
  ]
  
  const completedFields = auditFields.filter(field => {
    const value = data[field as keyof FullAuditData]
    return typeof value === 'number' && value > 0
  }).length
  const completion_score = completedFields / auditFields.length

  // Check audit gate
  if (completion_score < 0.70) {
    return {
      schema_version: '1.0',
      status: 'needs_more_data',
      mode: 'audit',
      completion_score,
      company: { industry: data.industry, role: data.role, size_band: data.size_band },
      gear: { number: 2, label: 'Grip', reason: 'Need more inputs to size your phase' },
      engines: [],
      accelerator: { kpi: '', cadence: 'weekly', recommended: false, user_override_allowed: true, notes: '' },
      brakes: { risk_level: 'medium', flags: ['Incomplete assessment'], controls: ['Complete remaining fields'] },
      goals: {
        north_star: { title: '', metric: '', current: null, target: null, due_date: null },
        departments: []
      },
      actions: { do_now: [], do_next: [] },
      meetings: {
        warm_up: { duration_min: 10, agenda: [] },
        pit_stop: { duration_min: 30, agenda: [] },
        full_tune_up: { duration_min: 75, agenda: [] }
      },
      exports: { actions_csv_ready: false, goals_csv_ready: false }
    }
  }

  const engines = calculateEngineScores(data)
  const gear = calculateGear(engines)
  const brakes = assessRisks(data, engines)

  // Generate actions from lowest scoring engines
  const sortedEngines = [...engines].sort((a, b) => a.score - b.score)
  
  // Map engines to appropriate owner roles
  const getOwnerForEngine = (engineName: string): 'Owner' | 'Ops' | 'Sales' | 'Finance' => {
    switch (engineName) {
      case 'Leadership': return 'Owner'
      case 'Operations': return 'Ops'
      case 'Marketing & Sales': return 'Sales'
      case 'Finance': return 'Finance'
      case 'Personnel': return 'Owner'
      default: return 'Owner'
    }
  }

  const do_now = sortedEngines.slice(0, 3).map(engine => ({
    title: engine.next_action,
    why: `Addresses ${engine.name} gap`,
    owner_role: getOwnerForEngine(engine.name),
    eta_days: 7,
    engine: engine.name
  }))

  const do_next = sortedEngines.slice(3, 5).map(engine => ({
    title: `Review ${engine.name} metrics weekly`,
    why: `Maintains ${engine.name} performance`,
    owner_role: getOwnerForEngine(engine.name),
    eta_days: 14,
    engine: engine.name
  }))

  return {
    schema_version: '1.0',
    status: 'ok',
    mode: 'audit',
    completion_score,
    company: {
      industry: data.industry,
      role: data.role,
      size_band: data.size_band
    },
    gear,
    engines,
    accelerator: {
      kpi: `Weekly ${sortedEngines[0].name} Score`,
      cadence: 'weekly',
      recommended: true,
      user_override_allowed: true,
      notes: `Focus on weakest engine first`
    },
    brakes,
    goals: {
      north_star: {
        title: data.north_star,
        metric: `Weekly ${sortedEngines[0].name} Score`,
        current: null,
        target: null,
        due_date: null
      },
      departments: [
        {
          department: 'Ops',
          title: 'Improve operational efficiency',
          metric: 'Weekly process completion rate',
          current: null,
          target: null,
          due_date: null,
          alignment_statement: 'Better operations directly support the North Star goal.'
        },
        {
          department: 'Sales/Marketing',
          title: 'Increase lead generation',
          metric: 'Weekly qualified leads',
          current: null,
          target: null,
          due_date: null,
          alignment_statement: 'More qualified leads accelerate revenue growth.'
        },
        {
          department: 'Finance',
          title: 'Optimize cash flow',
          metric: 'Weekly cash collection',
          current: null,
          target: null,
          due_date: null,
          alignment_statement: 'Strong cash flow enables sustainable growth.'
        }
      ]
    },
    actions: { do_now, do_next },
    meetings: {
      warm_up: { 
        duration_min: 10, 
        agenda: ['Check weekly accelerator progress', 'Identify today\'s top blocker', 'Set one action with owner'] 
      },
      pit_stop: { 
        duration_min: 30, 
        agenda: ['Review accelerator results', 'Address top engine gap', 'Set 3 actions for next week'] 
      },
      full_tune_up: { 
        duration_min: 75, 
        agenda: ['Assess North Star alignment', 'Review all engine health', 'Update quarterly goals', 'Reset accelerator if needed'] 
      }
    },
    exports: {
      actions_csv_ready: true,
      goals_csv_ready: true
    }
  }
}
