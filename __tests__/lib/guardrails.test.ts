import { validateActionAlignment } from '../../lib/guardrails'

describe('validateActionAlignment', () => {
  const northStar = {
    goal: 'Reach $2M revenue by December',
    vehicle: 'SaaS platform',
    constraint: 'limited budget'
  }

  test('valid alignment to goal', () => {
    const action = { title: 'Increase revenue streams', why: 'Boost monthly income' }
    const result = validateActionAlignment(action, northStar)
    
    expect(result.isValid).toBe(true)
    expect(result.alignedTo).toBe('goal')
  })

  test('valid alignment to vehicle', () => {
    const action = { title: 'Optimize SaaS onboarding', why: 'Improve platform experience' }
    const result = validateActionAlignment(action, northStar)
    
    expect(result.isValid).toBe(true)
    expect(result.alignedTo).toBe('vehicle')
  })

  test('valid alignment to constraint', () => {
    const action = { title: 'Cut costs', why: 'Work within budget limits' }
    const result = validateActionAlignment(action, northStar)
    
    expect(result.isValid).toBe(true)
    expect(result.alignedTo).toBe('constraint')
  })

  test('no alignment should fail', () => {
    const action = { title: 'Organize office party', why: 'Team building event' }
    const result = validateActionAlignment(action, northStar)
    
    expect(result.isValid).toBe(false)
    expect(result.reason).toContain('Action doesn\'t align with North Star')
  })

  test('no North Star should fail', () => {
    const action = { title: 'Any action', why: 'Some reason' }
    const emptyNorthStar = { goal: '' }
    const result = validateActionAlignment(action, emptyNorthStar)
    
    expect(result.isValid).toBe(false)
    expect(result.reason).toBe('No North Star defined. Set your goal first.')
  })
})