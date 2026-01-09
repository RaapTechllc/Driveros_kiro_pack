import { analyzeFlashScan } from '../lib/flash-analysis'
import { FlashScanData } from '../lib/types'

describe('Flash Analysis Engine', () => {
  const mockData: FlashScanData = {
    industry: 'Tech',
    size_band: '11-50',
    role: 'CEO',
    north_star: 'Hit $2M ARR by end of year',
    top_constraint: 'capacity issues with current team'
  }

  test('generates accelerator recommendation', () => {
    const result = analyzeFlashScan(mockData)
    
    expect(result.accelerator.kpi).toBe('Weekly Active Users')
    expect(result.accelerator.cadence).toBe('weekly')
    expect(result.accelerator.recommended).toBe(true)
  })

  test('generates quick wins based on constraint', () => {
    const result = analyzeFlashScan(mockData)
    
    expect(result.quick_wins).toHaveLength(4)
    expect(result.quick_wins[0].title).toContain('weekly Accelerator')
    expect(result.quick_wins[1].title).toContain('WIP limit')
  })

  test('estimates gear based on size', () => {
    const result = analyzeFlashScan(mockData)
    
    expect(result.gear_estimate.number).toBe(3)
    expect(result.gear_estimate.label).toBe('Drive')
    expect(result.gear_estimate.reason).toContain('Growing')
  })

  test('generates gear estimate', () => {
    const result = analyzeFlashScan(mockData)
    
    expect(result.gear_estimate.number).toBeGreaterThanOrEqual(1)
    expect(result.gear_estimate.number).toBeLessThanOrEqual(5)
    expect(result.gear_estimate.label).toBeDefined()
    expect(result.gear_estimate.reason).toBeDefined()
  })

  test('handles different constraint types', () => {
    const demandData = { ...mockData, top_constraint: 'demand' }
    const result = analyzeFlashScan(demandData)
    
    expect(result.accelerator.kpi).toBe('Weekly Active Users') // Based on Technology industry
    expect(result.quick_wins).toHaveLength(4)
    expect(result.quick_wins.some(win => win.title.includes('leads'))).toBe(true)
  })
})
