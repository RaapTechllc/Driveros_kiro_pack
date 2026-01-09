import { analyzeFullAudit, FullAuditData } from '../lib/full-audit-analysis'

describe('Full Audit Analysis Engine', () => {
  const mockData: FullAuditData = {
    // Flash Scan data
    industry: 'Tech',
    size_band: '11-50',
    role: 'CEO',
    north_star: 'Hit $2M ARR by end of year',
    top_constraint: 'capacity issues',
    
    // Leadership Engine
    vision_clarity: 4,
    decision_speed: 3,
    team_alignment: 4,
    
    // Operations Engine
    process_efficiency: 2,
    quality_control: 3,
    delivery_reliability: 2,
    
    // Marketing & Sales Engine
    lead_generation: 3,
    conversion_rate: 4,
    customer_retention: 3,
    
    // Finance Engine
    cash_flow_health: 4,
    profitability: 3,
    financial_planning: 2,
    
    // Personnel Engine
    team_satisfaction: 4,
    skill_gaps: 3, // 3 = average gaps
    retention_risk: 2 // 2 = low risk
  }

  test('enforces completion gate at 70%', () => {
    const incompleteData = { ...mockData }
    // Zero out some fields to drop below 70%
    incompleteData.vision_clarity = 0
    incompleteData.decision_speed = 0
    incompleteData.team_alignment = 0
    incompleteData.process_efficiency = 0
    incompleteData.quality_control = 0
    
    const result = analyzeFullAudit(incompleteData)
    
    expect(result.status).toBe('needs_more_data')
    expect(result.completion_score).toBeLessThan(0.70)
  })

  test('calculates engine scores correctly', () => {
    const result = analyzeFullAudit(mockData)
    
    expect(result.status).toBe('ok')
    expect(result.engines).toHaveLength(5)
    
    // Leadership should be good (4,3,4 avg = ~67)
    const leadership = result.engines.find(e => e.name === 'Leadership')
    expect(leadership?.score).toBeGreaterThan(60)
    expect(leadership?.status).toBe('yellow')
    
    // Operations should be poor (2,3,2 avg = ~42)
    const operations = result.engines.find(e => e.name === 'Operations')
    expect(operations?.score).toBeLessThan(50)
    expect(operations?.status).toBe('red')
  })

  test('maps scores to correct gear', () => {
    const result = analyzeFullAudit(mockData)
    
    // With mixed scores, should be in Drive range (3)
    expect(result.gear.number).toBe(3)
    expect(result.gear.label).toBe('Drive')
    expect(result.gear.reason).toContain('Growing')
  })

  test('generates actions from lowest engines', () => {
    const result = analyzeFullAudit(mockData)
    
    expect(result.actions.do_now).toHaveLength(3)
    expect(result.actions.do_next).toHaveLength(2)
    
    // Should prioritize Operations (lowest scoring engine)
    const operationsAction = result.actions.do_now.find(a => a.engine === 'Operations')
    expect(operationsAction).toBeDefined()
  })

  test('assesses risk levels correctly', () => {
    // Test high risk scenario - need 3+ flags for high risk
    const highRiskData = { 
      ...mockData, 
      cash_flow_health: 1, 
      retention_risk: 5,
      process_efficiency: 1, // This will create red engines
      quality_control: 1,
      delivery_reliability: 1
    }
    const result = analyzeFullAudit(highRiskData)
    
    expect(result.brakes.risk_level).toBe('high')
    expect(result.brakes.flags.length).toBeGreaterThan(2)
    expect(result.brakes.controls.length).toBeGreaterThan(0)
  })

  test('handles excellent performance', () => {
    const excellentData: FullAuditData = { ...mockData }
    // Set all audit scores to 5 (excellent)
    excellentData.vision_clarity = 5
    excellentData.decision_speed = 5
    excellentData.team_alignment = 5
    excellentData.process_efficiency = 5
    excellentData.quality_control = 5
    excellentData.delivery_reliability = 5
    excellentData.lead_generation = 5
    excellentData.conversion_rate = 5
    excellentData.customer_retention = 5
    excellentData.cash_flow_health = 5
    excellentData.profitability = 5
    excellentData.financial_planning = 5
    excellentData.team_satisfaction = 5
    excellentData.skill_gaps = 1 // 1 = no gaps (inverted)
    excellentData.retention_risk = 1 // 1 = no risk (inverted)
    
    const result = analyzeFullAudit(excellentData)
    
    expect(result.gear.number).toBe(5)
    expect(result.gear.label).toBe('Apex')
    expect(result.engines.every(e => e.status === 'green')).toBe(true)
  })
})
