import { getIndustryProfile, getConstraintSolutions, getPhaseRecommendations, INDUSTRY_PROFILES } from '../lib/industry-knowledge'

describe('Industry Knowledge Base', () => {
  test('has 12 industry profiles', () => {
    expect(Object.keys(INDUSTRY_PROFILES).length).toBe(12)
  })

  test('getIndustryProfile returns profile for exact match', () => {
    const profile = getIndustryProfile('Technology')
    expect(profile).not.toBeNull()
    expect(profile?.name).toBe('Technology/SaaS')
    expect(profile?.typicalPhase).toBe('Velocity')
  })

  test('getIndustryProfile returns profile for fuzzy match', () => {
    const profile = getIndustryProfile('tech')
    expect(profile).not.toBeNull()
    expect(profile?.name).toBe('Technology/SaaS')
  })

  test('getIndustryProfile returns null for unknown industry', () => {
    const profile = getIndustryProfile('Unknown Industry XYZ')
    expect(profile).toBeNull()
  })

  test('each profile has required fields', () => {
    for (const [key, profile] of Object.entries(INDUSTRY_PROFILES)) {
      expect(profile.id).toBeDefined()
      expect(profile.name).toBeDefined()
      expect(profile.typicalPhase).toBeDefined()
      expect(profile.ltvCacTarget.min).toBeGreaterThan(0)
      expect(profile.ltvCacTarget.ideal).toBeGreaterThan(profile.ltvCacTarget.min)
      expect(profile.commonConstraints.length).toBeGreaterThanOrEqual(3)
      expect(profile.brickMetrics.length).toBeGreaterThanOrEqual(3)
      expect(profile.accelerationActions.length).toBeGreaterThanOrEqual(3)
    }
  })

  test('getConstraintSolutions returns solutions for all constraint types', () => {
    const constraints = ['cash', 'capacity', 'demand', 'delivery', 'people']
    
    for (const constraint of constraints) {
      const solution = getConstraintSolutions(constraint)
      expect(solution.rootCause).toBeDefined()
      expect(solution.thirtyDayFix).toBeDefined()
      expect(solution.metrics.length).toBeGreaterThanOrEqual(2)
    }
  })

  test('getPhaseRecommendations returns recommendations for all phases', () => {
    const phases = ['Genesis', 'Momentum', 'Velocity', 'Mastery', 'Legacy'] as const
    
    for (const phase of phases) {
      const rec = getPhaseRecommendations(phase)
      expect(rec.focus).toBeDefined()
      expect(rec.keyMetric).toBeDefined()
      expect(rec.topActions.length).toBe(3)
    }
  })
})
