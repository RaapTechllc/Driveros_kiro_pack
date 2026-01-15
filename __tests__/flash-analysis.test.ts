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
    
    // Now uses industry-specific KPI from knowledge base
    expect(result.accelerator.kpi).toBeDefined()
    expect(result.accelerator.kpi.length).toBeGreaterThan(0)
    expect(result.accelerator.cadence).toBe('weekly')
    expect(result.accelerator.recommended).toBe(true)
  })

  test('generates quick wins based on constraint', () => {
    const result = analyzeFlashScan(mockData)
    
    expect(result.quick_wins.length).toBeGreaterThanOrEqual(3)
    expect(result.quick_wins.length).toBeLessThanOrEqual(5)
    expect(result.quick_wins[0].title).toContain('weekly Accelerator')
    // Other wins are now dynamic based on industry
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
    
    // Technology industry now uses industry-specific KPI
    expect(result.accelerator.kpi).toBeDefined()
    expect(result.quick_wins.length).toBeGreaterThanOrEqual(3)
    expect(result.quick_wins.length).toBeLessThanOrEqual(5)
    // Should have demand-related wins
    expect(result.quick_wins.some(win => 
      win.title.toLowerCase().includes('lead') || 
      win.engine === 'Marketing & Sales'
    )).toBe(true)
  })
})
