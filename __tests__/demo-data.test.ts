import { DEMO_COMPANY, DEMO_FLASH_RESULT, DEMO_FULL_AUDIT_RESULT } from '../lib/demo-data'

describe('Demo Data', () => {
  test('demo company has required fields', () => {
    expect(DEMO_COMPANY.name).toBe('TechFlow Solutions')
    expect(DEMO_COMPANY.industry).toBe('Tech')
    expect(DEMO_COMPANY.size).toBe('11-50')
    expect(DEMO_COMPANY.role).toBe('Owner')
    expect(DEMO_COMPANY.northStar).toContain('$2M ARR')
    expect(DEMO_COMPANY.constraint).toBe('capacity')
  })

  test('demo flash result has valid schema', () => {
    expect(DEMO_FLASH_RESULT.schema_version).toBe('1.0')
    expect(DEMO_FLASH_RESULT.accelerator.kpi).toBe('Weekly Active Users')
    expect(DEMO_FLASH_RESULT.accelerator.cadence).toBe('weekly')
    expect(DEMO_FLASH_RESULT.gear_estimate.number).toBe(3)
    expect(DEMO_FLASH_RESULT.gear_estimate.label).toBe('Drive')
    expect(DEMO_FLASH_RESULT.quick_wins).toHaveLength(4)
  })

  test('demo full audit result has valid schema', () => {
    expect(DEMO_FULL_AUDIT_RESULT.schema_version).toBe('1.0')
    expect(DEMO_FULL_AUDIT_RESULT.mode).toBe('audit')
    expect(DEMO_FULL_AUDIT_RESULT.completion_score).toBe(1.0)
    expect(DEMO_FULL_AUDIT_RESULT.engines).toHaveLength(5)
    expect(DEMO_FULL_AUDIT_RESULT.gear.number).toBe(3)
    expect(DEMO_FULL_AUDIT_RESULT.gear.label).toBe('Drive')
  })

  test('demo full audit has proper engine scores', () => {
    const engines = DEMO_FULL_AUDIT_RESULT.engines
    
    // Check all engines are present
    const engineNames = engines.map(e => e.name)
    expect(engineNames).toContain('Leadership')
    expect(engineNames).toContain('Operations')
    expect(engineNames).toContain('Marketing & Sales')
    expect(engineNames).toContain('Finance')
    expect(engineNames).toContain('Personnel')
    
    // Check scores are valid
    engines.forEach(engine => {
      expect(engine.score).toBeGreaterThanOrEqual(0)
      expect(engine.score).toBeLessThanOrEqual(100)
      expect(['green', 'yellow', 'red']).toContain(engine.status)
      expect(engine.rationale).toBeTruthy()
      expect(engine.next_action).toBeTruthy()
    })
  })

  test('demo full audit has proper actions structure', () => {
    const { actions } = DEMO_FULL_AUDIT_RESULT
    
    expect(actions.do_now).toHaveLength(3)
    expect(actions.do_next).toHaveLength(3)
    
    // Check action structure
    actions.do_now.forEach(action => {
      expect(action.title).toBeTruthy()
      expect(action.why).toBeTruthy()
      expect(['Owner', 'Ops', 'Sales', 'Finance']).toContain(action.owner_role)
      expect(action.eta_days).toBeGreaterThan(0)
      expect(action.engine).toBeTruthy()
    })
  })

  test('demo full audit has proper goals structure', () => {
    const { goals } = DEMO_FULL_AUDIT_RESULT
    
    // North Star
    expect(goals.north_star.title).toContain('$2M ARR')
    expect(goals.north_star.metric).toBe('Annual Recurring Revenue')
    expect(goals.north_star.current).toBe(850000)
    expect(goals.north_star.target).toBe(2000000)
    
    // Department goals
    expect(goals.departments).toHaveLength(3)
    goals.departments.forEach(dept => {
      expect(['Ops', 'Sales/Marketing', 'Finance']).toContain(dept.department)
      expect(dept.title).toBeTruthy()
      expect(dept.alignment_statement).toBeTruthy()
    })
  })
})
