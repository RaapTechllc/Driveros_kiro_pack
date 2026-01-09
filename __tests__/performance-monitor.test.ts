import { performanceMonitor, trackCSVOperation, trackAnalysisOperation } from '../lib/performance-monitor'

describe('Performance Monitor', () => {
  beforeEach(() => {
    performanceMonitor.clear()
  })

  describe('trackSync', () => {
    it('should track successful operations', () => {
      const result = performanceMonitor.trackSync('test-operation', () => {
        return 'success'
      })

      expect(result).toBe('success')
      
      const stats = performanceMonitor.getOperationStats('test-operation')
      expect(stats.count).toBe(1)
      expect(stats.successRate).toBe(1)
      expect(stats.avgDuration).toBeGreaterThan(0)
    })

    it('should track failed operations', () => {
      expect(() => {
        performanceMonitor.trackSync('test-operation', () => {
          throw new Error('Test error')
        })
      }).toThrow('Test error')
      
      const stats = performanceMonitor.getOperationStats('test-operation')
      expect(stats.count).toBe(1)
      expect(stats.successRate).toBe(0)
      expect(stats.recentErrors).toContain('Test error')
    })

    it('should include metadata in metrics', () => {
      performanceMonitor.trackSync('test-operation', () => 'success', { testData: 'value' })
      
      const exported = performanceMonitor.exportMetrics()
      expect(exported.metrics[0].metadata).toEqual({ testData: 'value' })
    })
  })

  describe('trackOperation', () => {
    it('should track async operations', async () => {
      const result = await performanceMonitor.trackOperation('async-test', async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return 'async-success'
      })

      expect(result).toBe('async-success')
      
      const stats = performanceMonitor.getOperationStats('async-test')
      expect(stats.count).toBe(1)
      expect(stats.successRate).toBe(1)
      expect(stats.avgDuration).toBeGreaterThan(5) // More lenient timing
    })

    it('should track async failures', async () => {
      await expect(
        performanceMonitor.trackOperation('async-test', async () => {
          throw new Error('Async error')
        })
      ).rejects.toThrow('Async error')
      
      const stats = performanceMonitor.getOperationStats('async-test')
      expect(stats.count).toBe(1)
      expect(stats.successRate).toBe(0)
    })
  })

  describe('getOperationStats', () => {
    it('should return empty stats for unknown operation', () => {
      const stats = performanceMonitor.getOperationStats('unknown')
      
      expect(stats).toEqual({
        count: 0,
        successRate: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        recentErrors: []
      })
    })

    it('should calculate correct statistics', () => {
      // Add multiple operations with different durations
      performanceMonitor.trackSync('test-op', () => { 
        // Simulate work
        const start = performance.now()
        while (performance.now() - start < 5) {} // ~5ms
        return 'success'
      })
      
      performanceMonitor.trackSync('test-op', () => {
        const start = performance.now()
        while (performance.now() - start < 10) {} // ~10ms
        return 'success'
      })
      
      try {
        performanceMonitor.trackSync('test-op', () => {
          throw new Error('Test failure')
        })
      } catch {}
      
      const stats = performanceMonitor.getOperationStats('test-op')
      expect(stats.count).toBe(3)
      expect(stats.successRate).toBeCloseTo(2/3, 2)
      expect(stats.avgDuration).toBeGreaterThan(0)
      expect(stats.minDuration).toBeGreaterThan(0)
      expect(stats.maxDuration).toBeGreaterThan(stats.minDuration)
      expect(stats.recentErrors).toContain('Test failure')
    })
  })

  describe('getSystemHealth', () => {
    it('should return system health metrics', () => {
      // Add some operations
      performanceMonitor.trackSync('fast-op', () => 'success')
      performanceMonitor.trackSync('slow-op', () => {
        const start = performance.now()
        while (performance.now() - start < 1100) {} // >1 second
        return 'success'
      })
      
      try {
        performanceMonitor.trackSync('error-op', () => {
          throw new Error('System error')
        })
      } catch {}
      
      const health = performanceMonitor.getSystemHealth()
      
      expect(health.totalOperations).toBe(3)
      expect(health.overallSuccessRate).toBeCloseTo(2/3, 2)
      expect(health.slowOperations).toHaveLength(1)
      expect(health.slowOperations[0].operation).toBe('slow-op')
      expect(health.errorRate).toBeGreaterThan(0)
      expect(health.recentErrors).toHaveLength(1)
    })
  })

  describe('convenience functions', () => {
    it('should track CSV operations', () => {
      const result = trackCSVOperation('csv-parse', () => {
        return ['row1', 'row2', 'row3']
      }, 3)
      
      expect(result).toEqual(['row1', 'row2', 'row3'])
      
      const stats = performanceMonitor.getOperationStats('csv-parse')
      expect(stats.count).toBe(1)
      
      const exported = performanceMonitor.exportMetrics()
      expect(exported.metrics[0].metadata).toEqual({ rowCount: 3 })
    })

    it('should track analysis operations', async () => {
      const result = await trackAnalysisOperation('flash-analysis', () => {
        return { gear: 3, engines: [] }
      }, 5)
      
      expect(result).toEqual({ gear: 3, engines: [] })
      
      const stats = performanceMonitor.getOperationStats('flash-analysis')
      expect(stats.count).toBe(1)
    })
  })

  describe('data management', () => {
    it('should export metrics and errors', () => {
      performanceMonitor.trackSync('test', () => 'success')
      performanceMonitor.logError('test', new Error('Test error'))
      
      const exported = performanceMonitor.exportMetrics()
      
      expect(exported.metrics).toHaveLength(1)
      expect(exported.errors).toHaveLength(1)
      expect(exported.exportedAt).toBeDefined()
    })

    it('should clear all data', () => {
      performanceMonitor.trackSync('test', () => 'success')
      performanceMonitor.logError('test', new Error('Test error'))
      
      performanceMonitor.clear()
      
      const exported = performanceMonitor.exportMetrics()
      expect(exported.metrics).toHaveLength(0)
      expect(exported.errors).toHaveLength(0)
    })
  })
})
