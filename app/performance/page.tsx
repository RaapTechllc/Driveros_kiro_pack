'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { performanceMonitor } from '@/lib/performance-monitor'
import { Activity, AlertTriangle, Clock, Download, RefreshCw } from 'lucide-react'

export default function PerformancePage() {
  const [health, setHealth] = useState<ReturnType<typeof performanceMonitor.getSystemHealth> | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setHealth(performanceMonitor.getSystemHealth())
  }, [refreshKey])

  const handleExport = () => {
    const data = performanceMonitor.exportMetrics()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!health) return <div className="p-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">System health and operation metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{health.totalOperations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {health.totalOperations > 0 ? `${(health.overallSuccessRate * 100).toFixed(1)}%` : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {health.totalOperations > 0 ? `${(health.errorRate * 100).toFixed(1)}%` : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slow Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Slow Operations (&gt;1s)</CardTitle>
        </CardHeader>
        <CardContent>
          {health.slowOperations.length === 0 ? (
            <p className="text-muted-foreground">No slow operations detected</p>
          ) : (
            <div className="space-y-2">
              {health.slowOperations.map((op, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-mono text-sm">{op.operation}</span>
                  <span className="text-orange-600 font-medium">{op.avgDuration.toFixed(0)}ms</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
        </CardHeader>
        <CardContent>
          {health.recentErrors.length === 0 ? (
            <p className="text-muted-foreground">No recent errors</p>
          ) : (
            <div className="space-y-2">
              {health.recentErrors.map((err) => (
                <div key={err.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono text-red-700 dark:text-red-400">{err.operation}</span>
                    <span className="text-muted-foreground">{new Date(err.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm mt-1">{err.error}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
