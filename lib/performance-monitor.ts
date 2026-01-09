/**
 * Performance Monitoring & Error Tracking Utilities
 * 
 * Provides systematic performance monitoring and error tracking for DriverOS
 * backend operations without external dependencies.
 */

export interface PerformanceMetric {
  operation: string
  duration: number
  timestamp: string
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

export interface ErrorLog {
  id: string
  operation: string
  error: string
  stack?: string
  timestamp: string
  context?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private errors: ErrorLog[] = []
  private maxMetrics = 1000 // Keep last 1000 metrics
  private maxErrors = 500   // Keep last 500 errors

  /**
   * Track performance of an operation
   */
  async trackOperation<T>(
    operation: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now()
    const timestamp = new Date().toISOString()
    
    try {
      const result = await fn()
      const duration = performance.now() - startTime
      
      this.addMetric({
        operation,
        duration,
        timestamp,
        success: true,
        metadata
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      this.addMetric({
        operation,
        duration,
        timestamp,
        success: false,
        error: errorMessage,
        metadata
      })
      
      this.logError(operation, error, metadata)
      throw error
    }
  }

  /**
   * Track synchronous operation performance
   */
  trackSync<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const startTime = performance.now()
    const timestamp = new Date().toISOString()
    
    try {
      const result = fn()
      const duration = performance.now() - startTime
      
      this.addMetric({
        operation,
        duration,
        timestamp,
        success: true,
        metadata
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      this.addMetric({
        operation,
        duration,
        timestamp,
        success: false,
        error: errorMessage,
        metadata
      })
      
      this.logError(operation, error, metadata)
      throw error
    }
  }

  /**
   * Log an error without performance tracking
   */
  logError(operation: string, error: unknown, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      operation,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      context
    }
    
    this.addError(errorLog)
  }

  /**
   * Get performance statistics for an operation
   */
  getOperationStats(operation: string): {
    count: number
    successRate: number
    avgDuration: number
    minDuration: number
    maxDuration: number
    recentErrors: string[]
  } {
    const operationMetrics = this.metrics.filter(m => m.operation === operation)
    
    if (operationMetrics.length === 0) {
      return {
        count: 0,
        successRate: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        recentErrors: []
      }
    }
    
    const successCount = operationMetrics.filter(m => m.success).length
    const durations = operationMetrics.map(m => m.duration)
    const recentErrors = this.errors
      .filter(e => e.operation === operation)
      .slice(-5)
      .map(e => e.error)
    
    return {
      count: operationMetrics.length,
      successRate: successCount / operationMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      recentErrors
    }
  }

  /**
   * Get overall system health metrics
   */
  getSystemHealth(): {
    totalOperations: number
    overallSuccessRate: number
    slowOperations: Array<{ operation: string; avgDuration: number }>
    errorRate: number
    recentErrors: ErrorLog[]
  } {
    const totalOperations = this.metrics.length
    const successCount = this.metrics.filter(m => m.success).length
    
    // Group by operation and calculate average duration
    const operationGroups = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.operation]) {
        acc[metric.operation] = []
      }
      acc[metric.operation].push(metric.duration)
      return acc
    }, {} as Record<string, number[]>)
    
    const slowOperations = Object.entries(operationGroups)
      .map(([operation, durations]) => ({
        operation,
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length
      }))
      .filter(op => op.avgDuration > 1000) // Operations slower than 1 second
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10)
    
    return {
      totalOperations,
      overallSuccessRate: totalOperations > 0 ? successCount / totalOperations : 0,
      slowOperations,
      errorRate: this.errors.length / Math.max(totalOperations, 1),
      recentErrors: this.errors.slice(-10)
    }
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): {
    metrics: PerformanceMetric[]
    errors: ErrorLog[]
    exportedAt: string
  } {
    return {
      metrics: [...this.metrics],
      errors: [...this.errors],
      exportedAt: new Date().toISOString()
    }
  }

  /**
   * Clear all metrics and errors
   */
  clear(): void {
    this.metrics = []
    this.errors = []
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  private addError(error: ErrorLog): void {
    this.errors.push(error)
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor()

// Convenience functions for common operations
export const trackCSVOperation = <T>(
  operation: string,
  fn: () => T,
  rowCount?: number
): T => {
  return performanceMonitor.trackSync(operation, fn, { rowCount })
}

export const trackAnalysisOperation = async <T>(
  operation: string,
  fn: () => Promise<T> | T,
  inputSize?: number
): Promise<T> => {
  return performanceMonitor.trackOperation(operation, fn, { inputSize })
}

export const trackStorageOperation = <T>(
  operation: string,
  fn: () => T,
  dataSize?: number
): T => {
  return performanceMonitor.trackSync(operation, fn, { dataSize })
}
