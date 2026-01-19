import { getLastWeekSummary, generateWeeklyPlan } from '@/lib/pit-stop/planning'
import type { Action, NorthStar } from '@/lib/supabase/types'

// Simple test without complex mocking - use demo mode
beforeEach(() => {
  localStorage.clear()
})

const createAction = (overrides: Partial<Action> = {}): Action => ({
  id: `action-${Math.random()}`,
  org_id: 'test-org',
  title: 'Test Action',
  description: null,
  why: null,
  owner: null,
  engine: null,
  priority: 'do_next',
  status: 'not_started',
  effort: null,
  due_date: null,
  north_star_id: null,
  source: null,
  created_by: 'test-user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

const createNorthStar = (): NorthStar => ({
  id: 'ns-1',
  org_id: 'test-org',
  goal: 'Increase revenue',
  vehicle: 'SaaS platform',
  constraint: 'Limited budget',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
})

describe('Pit Stop Planning', () => {
  it('getLastWeekSummary returns correct structure', async () => {
    const result = await getLastWeekSummary('test-org')
    
    expect(result).toHaveProperty('completed')
    expect(result).toHaveProperty('missed')
    expect(result).toHaveProperty('totalActions')
    expect(result).toHaveProperty('completionRate')
    expect(Array.isArray(result.completed)).toBe(true)
    expect(Array.isArray(result.missed)).toBe(true)
  })

  it('generateWeeklyPlan returns max 3 actions', async () => {
    const summary = { 
      completed: [], 
      missed: [], 
      totalActions: 0, 
      completionRate: 0 
    }
    const northStar = createNorthStar()
    
    const result = await generateWeeklyPlan(summary, northStar, 'test-org')
    
    expect(result).toHaveProperty('actions')
    expect(result).toHaveProperty('rationale')
    expect(result.actions.length).toBeLessThanOrEqual(3)
  })

  it('generateWeeklyPlan returns valid structure', async () => {
    const summary = { 
      completed: [], 
      missed: [], 
      totalActions: 0, 
      completionRate: 0 
    }
    const northStar = createNorthStar()
    
    const result = await generateWeeklyPlan(summary, northStar, 'test-org')
    
    expect(typeof result.rationale).toBe('string')
    expect(result.rationale.length).toBeGreaterThan(0)
  })
})
