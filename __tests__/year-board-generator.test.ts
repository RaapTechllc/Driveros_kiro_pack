import { generateYearPlan, getPlanStats, saveGeneratedPlan } from '../lib/year-board-generator'
import { saveYearPlan, saveYearItems } from '../lib/year-board-storage'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock demo-mode module
jest.mock('../lib/demo-mode', () => ({
  isDemoMode: jest.fn(() => false)
}))

// Mock year-board-storage module
jest.mock('../lib/year-board-storage', () => ({
  createYearPlan: jest.fn((northStarGoalId?: string) => ({
    id: `year-plan-${new Date().getFullYear()}`,
    tenant_id: 'test-tenant',
    company_id: 'test-company',
    year: new Date().getFullYear(),
    north_star_goal_id: northStarGoalId,
    created_by: 'test-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })),
  createYearItem: jest.fn((
    type: string,
    title: string,
    department: string,
    quarter: number,
    rationale: string,
    yearPlanId: string
  ) => ({
    id: `year-item-${Math.random().toString(36).substr(2, 9)}`,
    year_plan_id: yearPlanId,
    type,
    title,
    department,
    quarter,
    rationale,
    alignment_status: 'linked',
    created_by: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })),
  saveYearPlan: jest.fn(),
  saveYearItems: jest.fn(),
  loadYearPlan: jest.fn(),
  loadYearItems: jest.fn(),
}))

describe('Year Board Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateYearPlan', () => {
    it('should generate a plan with correct item counts', () => {
      const { plan, items } = generateYearPlan('test-north-star')
      
      expect(plan).toBeDefined()
      expect(plan.id).toMatch(/^year-plan-/)
      expect(plan.year).toBe(new Date().getFullYear())
      expect(plan.north_star_goal_id).toBe('test-north-star')
      
      const stats = getPlanStats(items)
      
      // Verify counts match specification
      expect(stats.milestones).toBeGreaterThanOrEqual(3)
      expect(stats.milestones).toBeLessThanOrEqual(6)
      expect(stats.plays).toBe(6) // Exactly 6 plays
      expect(stats.rituals).toBe(4) // Exactly 4 rituals (one per quarter)
      expect(stats.tuneups).toBe(4) // 4 tune-ups (one per quarter)
      
      // All items should be linked when North Star is provided
      expect(stats.linked).toBe(items.length)
      expect(stats.unlinked).toBe(0)
    })

    it('should generate unlinked items when no North Star provided', () => {
      const { plan, items } = generateYearPlan()
      
      expect(plan.north_star_goal_id).toBeUndefined()
      
      const stats = getPlanStats(items)
      
      // All items should be unlinked when no North Star
      expect(stats.unlinked).toBe(items.length)
      expect(stats.linked).toBe(0)
    })

    it('should distribute rituals across quarters', () => {
      const { items } = generateYearPlan('test-north-star')
      
      const rituals = items.filter(item => item.type === 'ritual')
      const quarters = rituals.map(ritual => ritual.quarter).sort()
      
      // Should have one ritual per quarter
      expect(quarters).toEqual([1, 2, 3, 4])
    })

    it('should distribute plays across quarters', () => {
      const { items } = generateYearPlan('test-north-star')
      
      const plays = items.filter(item => item.type === 'play')
      const quarterCounts = [1, 2, 3, 4].map(q => 
        plays.filter(play => play.quarter === q).length
      )
      
      // Should have plays in multiple quarters (not all in one quarter)
      const quartersWithPlays = quarterCounts.filter(count => count > 0).length
      expect(quartersWithPlays).toBeGreaterThan(1)
    })

    it('should assign items to different departments', () => {
      const { items } = generateYearPlan('test-north-star')
      
      const departments = [...new Set(items.map(item => item.department))]
      
      // Should use multiple departments
      expect(departments.length).toBeGreaterThan(1)
      expect(departments).toContain('company') // Milestones and tune-ups
    })

    it('should generate items with required fields', () => {
      const { items } = generateYearPlan('test-north-star')
      
      items.forEach(item => {
        expect(item.id).toBeDefined()
        expect(item.title).toBeDefined()
        expect(item.rationale).toBeDefined()
        expect(item.type).toMatch(/^(milestone|play|ritual|tuneup)$/)
        expect(item.department).toMatch(/^(company|ops|sales_marketing|finance)$/)
        expect(item.quarter).toBeGreaterThanOrEqual(1)
        expect(item.quarter).toBeLessThanOrEqual(4)
        expect(item.alignment_status).toMatch(/^(linked|unlinked)$/)
        expect(item.created_at).toBeDefined()
        expect(item.updated_at).toBeDefined()
      })
    })
  })

  describe('getPlanStats', () => {
    it('should correctly count item types', () => {
      const { items } = generateYearPlan('test-north-star')
      const stats = getPlanStats(items)
      
      const actualCounts = {
        milestones: items.filter(i => i.type === 'milestone').length,
        plays: items.filter(i => i.type === 'play').length,
        rituals: items.filter(i => i.type === 'ritual').length,
        tuneups: items.filter(i => i.type === 'tuneup').length,
        linked: items.filter(i => i.alignment_status === 'linked').length,
        unlinked: items.filter(i => i.alignment_status === 'unlinked').length
      }
      
      expect(stats).toEqual(actualCounts)
    })
  })

  describe('saveGeneratedPlan', () => {
    it('should save plan and items to storage', () => {
      const mockSaveYearPlan = saveYearPlan as jest.MockedFunction<typeof saveYearPlan>
      const mockSaveYearItems = saveYearItems as jest.MockedFunction<typeof saveYearItems>
      
      saveGeneratedPlan('test-north-star')
      
      // Should have called the storage functions
      expect(mockSaveYearPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^year-plan-/),
          year: new Date().getFullYear(),
          north_star_goal_id: 'test-north-star'
        })
      )
      expect(mockSaveYearItems).toHaveBeenCalledWith(
        expect.any(Array),
        new Date().getFullYear()
      )
    })
  })
})
