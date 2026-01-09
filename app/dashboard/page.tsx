'use client'

import { useState, useEffect } from 'react'
import { FullAuditResult } from '@/lib/full-audit-analysis'
import { FlashScanResult } from '@/lib/types'
import { loadImportedActions, loadImportedGoals, transformImportedActions, transformImportedGoals } from '@/lib/imported-data'
import { exportActions, exportGoals, exportMeetingTemplates, exportCombinedData, exportExcelReady, downloadCSV } from '@/lib/csv-export'
import { getEngineHistory, calcTrend, saveEngineSnapshot, TrendDirection } from '@/lib/engine-history'
import { Button } from '@/components/ui/Button'
import { GuidedTour } from '@/components/demo/GuidedTour'
import { BusinessGearIndicator } from '@/components/dashboard/BusinessGearIndicator'
import { EngineCard, AcceleratorCard } from '@/components/dashboard/BusinessMetrics'
import { ActionCard } from '@/components/dashboard/ActionCard'
import { GoalProgress } from '@/components/dashboard/GoalProgress'
import { ActionFiltersBar, ActionFilters, filterActions } from '@/components/dashboard/ActionFilters'
import { getActionStatus } from '@/lib/action-status'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { Download, AlertTriangle, CheckCircle, Clock, Target, FileText, Database, Table, Camera } from 'lucide-react'

export default function DashboardPage() {
  const [auditResult, setAuditResult] = useState<FullAuditResult | null>(null)
  const [flashResult, setFlashResult] = useState<FlashScanResult | null>(null)
  const [importedActions, setImportedActions] = useState<any[]>([])
  const [importedGoals, setImportedGoals] = useState<any>({ northStar: null, departments: [] })
  const [showTour, setShowTour] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [engineTrends, setEngineTrends] = useState<Record<string, TrendDirection>>({})
  const [snapshotSaved, setSnapshotSaved] = useState(false)
  const [actionFilters, setActionFilters] = useState<ActionFilters>({ engine: 'all', owner: 'all', status: 'all' })

  useEffect(() => {
    // Check if this is demo mode
    const demoMode = localStorage.getItem('demo-mode') === 'true'
    const tourCompleted = localStorage.getItem('demo-tour-completed') === 'true'

    setIsDemoMode(demoMode)

    // Load results from localStorage with error handling
    try {
      const savedAudit = localStorage.getItem('full-audit-result')
      const savedFlash = localStorage.getItem('flash-scan-result')

      if (savedAudit) {
        const auditData = JSON.parse(savedAudit)
        // Basic validation
        if (auditData && auditData.schema_version === '1.0') {
          setAuditResult(auditData)
          // Show tour for demo mode if not completed
          if (demoMode && !tourCompleted) {
            setShowTour(true)
          }
          // Calculate engine trends
          const history = getEngineHistory()
          const trends: Record<string, TrendDirection> = {}
          auditData.engines?.forEach((e: any) => {
            trends[e.name] = calcTrend(e.name, history)
          })
          setEngineTrends(trends)
        }
      } else if (savedFlash) {
        const flashData = JSON.parse(savedFlash)
        // Basic validation
        if (flashData && flashData.schema_version === '1.0') {
          setFlashResult(flashData)
        }
      }

      // Load imported data
      const actions = loadImportedActions()
      const goals = loadImportedGoals()
      setImportedActions(transformImportedActions(actions))
      setImportedGoals(transformImportedGoals(goals))
    } catch (error) {
      console.error('Failed to load data:', error)
      // Clear corrupted data
      localStorage.removeItem('full-audit-result')
      localStorage.removeItem('flash-scan-result')
    }
  }, [])

  const clearAllData = () => {
    if (isDemoMode) {
      const message = 'Exit demo mode and restore your original data?'
      if (confirm(message)) {
        // Restore backup if it exists
        const backup = localStorage.getItem('demo-backup')
        if (backup) {
          try {
            const backupData = JSON.parse(backup)
            Object.entries(backupData).forEach(([key, value]) => {
              if (value) {
                localStorage.setItem(key, value as string)
              }
            })
            localStorage.removeItem('demo-backup')
          } catch (error) {
            console.error('Failed to restore backup:', error)
          }
        }

        // Clear demo mode
        localStorage.removeItem('demo-mode')
        localStorage.removeItem('demo-tour-completed')
        localStorage.removeItem('full-audit-result')

        // Reload to show restored data
        window.location.reload()
      }
    } else {
      const message = 'This will delete all data and start fresh. Are you sure?'
      if (confirm(message)) {
        localStorage.removeItem('full-audit-result')
        localStorage.removeItem('flash-scan-result')
        localStorage.removeItem('full-audit-data')
        localStorage.removeItem('flash-scan-data')
        setAuditResult(null)
        setFlashResult(null)
        setIsDemoMode(false)
      }
    }
  }

  const exportDataBackup = () => {
    try {
      const backupData = {
        flash_result: flashResult,
        audit_result: auditResult,
        export_timestamp: Date.now(),
        schema_version: '1.0'
      }

      const jsonData = JSON.stringify(backupData, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `driveros-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export backup:', error)
      alert('Failed to export backup. Please try again.')
    }
  }

  const exportCSV = (type: 'actions' | 'goals' | 'meetings' | 'combined' | 'excel') => {
    const timestamp = new Date().toISOString().split('T')[0]
    
    switch (type) {
      case 'actions':
        const actionsCSV = exportActions(auditResult || undefined, flashResult || undefined)
        downloadCSV(actionsCSV, `driveros-actions-${timestamp}.csv`)
        break
        
      case 'goals':
        const goalsCSV = exportGoals(auditResult || undefined)
        downloadCSV(goalsCSV, `driveros-goals-${timestamp}.csv`)
        break
        
      case 'meetings':
        const meetingsCSV = exportMeetingTemplates()
        downloadCSV(meetingsCSV, `driveros-meetings-${timestamp}.csv`)
        break
        
      case 'combined':
        const combinedCSV = exportCombinedData(auditResult || undefined, flashResult || undefined)
        downloadCSV(combinedCSV, `driveros-complete-${timestamp}.csv`)
        break
        
      case 'excel':
        const excelCSV = exportExcelReady(auditResult || undefined, flashResult || undefined)
        downloadCSV(excelCSV, `driveros-excel-ready-${timestamp}.csv`)
        break
    }
  }

  if (!auditResult && !flashResult) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6 max-w-md">
            <h1 className="text-3xl font-bold">Welcome to DriverOS</h1>
            <p className="text-muted-foreground">
              Get instant business insights and actionable recommendations. Start with a quick Flash Scan to see your results here.
            </p>
            <div className="space-y-4">
              <Link href="/flash-scan">
                <Button size="lg" className="w-full">
                  Start Flash Scan (5 minutes)
                </Button>
              </Link>
              <Link href="/full-audit">
                <Button variant="outline" size="lg" className="w-full">
                  Full Audit (15 minutes)
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Flash Scan provides instant recommendations. Full Audit gives detailed engine analysis.
            </p>
          </div>
        </div>
      </>
    )
  }

  // Show Full Audit dashboard if available, otherwise Flash Scan
  const result = auditResult || flashResult
  const isFullAudit = !!auditResult

  // Check if we have data to export
  const hasActions = isFullAudit
    ? (auditResult!.actions.do_now.length > 0 || auditResult!.actions.do_next.length > 0)
    : (flashResult!.quick_wins.length > 0)

  const hasGoals = isFullAudit
    ? (auditResult!.goals.north_star.title || auditResult!.goals.departments.length > 0)
    : !!flashResult!.accelerator.kpi

  return (
    <>
      {/* Gradient mesh background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-500/10 dark:bg-yellow-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Demo Banner handled by global TopBanner */}

      {/* Guided Tour */}
      {showTour && (
        <GuidedTour onComplete={() => setShowTour(false)} />
      )}

      <div className="space-y-8">
        {/* Business Gear Indicator */}
        <div data-tour="gear">
          <BusinessGearIndicator
            gear={isFullAudit ? auditResult!.gear.number : flashResult!.gear_estimate.number}
            phase={isFullAudit ? auditResult!.gear.label : flashResult!.gear_estimate.label}
            description={isFullAudit ? auditResult!.gear.reason : flashResult!.gear_estimate.reason}
            progress={isFullAudit ? auditResult!.completion_score : flashResult!.confidence_score}
          />
        </div>

        {/* Weekly Accelerator */}
        <div data-tour="accelerator">
          <AcceleratorCard
            accelerator={{
              kpi: isFullAudit ? auditResult!.accelerator.kpi : flashResult!.accelerator.kpi,
              cadence: isFullAudit ? auditResult!.accelerator.cadence : flashResult!.accelerator.cadence,
              recommended: isFullAudit ? auditResult!.accelerator.recommended : flashResult!.accelerator.recommended,
              notes: isFullAudit ? auditResult!.accelerator.notes : flashResult!.accelerator.notes
            }}
          />
        </div>

        {/* Signal Board - Engines (Full Audit only) */}
        {isFullAudit && (
          <div className="space-y-6" data-tour="engines">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Signal Board</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const scores: Record<string, number> = {}
                  auditResult!.engines.forEach(e => { scores[e.name] = e.score })
                  saveEngineSnapshot(scores)
                  setSnapshotSaved(true)
                  setTimeout(() => setSnapshotSaved(false), 2000)
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                {snapshotSaved ? 'Saved!' : 'Save Snapshot'}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auditResult!.engines.map((engine, index) => (
                <EngineCard key={index} engine={engine} trend={engineTrends[engine.name]} />
              ))}
            </div>
          </div>
        )}

        {/* Goal Progress (Full Audit only) */}
        {isFullAudit && auditResult!.goals && (
          <GoalProgress
            northStar={auditResult!.goals.north_star}
            departments={auditResult!.goals.departments}
          />
        )}

        {/* Quick Wins (Flash Scan) or Action Bay (Full Audit) */}
        <div className="space-y-6" data-tour="actions">
          <h2 className="text-2xl font-semibold">
            {isFullAudit ? 'Action Bay' : 'Quick Wins'}
          </h2>

          {isFullAudit && (
            <ActionFiltersBar filters={actionFilters} onChange={setActionFilters} />
          )}

          {isFullAudit ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Do Now</span>
                  </CardTitle>
                  <CardDescription>High priority actions requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filterActions(auditResult!.actions.do_now, actionFilters, (a) => getActionStatus(a.title)).map((action, index) => (
                    <ActionCard
                      key={`generated-now-${index}`}
                      title={action.title}
                      why={action.why}
                      owner_role={action.owner_role}
                      eta_days={action.eta_days}
                      engine={action.engine}
                      source="generated"
                    />
                  ))}
                  {filterActions(importedActions.filter(action => action.status === 'todo'), actionFilters).map((action, index) => (
                    <ActionCard
                      key={`imported-now-${index}`}
                      title={action.title}
                      why={action.why}
                      owner_role={action.owner_role}
                      eta_days={action.eta_days}
                      engine={action.engine}
                      source="imported"
                    />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span>Do Next</span>
                  </CardTitle>
                  <CardDescription>Important actions to tackle after immediate priorities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filterActions(auditResult!.actions.do_next, actionFilters, (a) => getActionStatus(a.title)).map((action, index) => (
                    <ActionCard
                      key={`generated-next-${index}`}
                      title={action.title}
                      why={action.why}
                      owner_role={action.owner_role}
                      eta_days={action.eta_days}
                      engine={action.engine}
                      source="generated"
                    />
                  ))}
                  {filterActions(importedActions.filter(action => action.status === 'doing'), actionFilters).map((action, index) => (
                    <ActionCard
                      key={`imported-next-${index}`}
                      title={action.title}
                      why={action.why}
                      owner_role={action.owner_role}
                      eta_days={action.eta_days}
                      engine={action.engine}
                      source="imported"
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="quick-wins">
              {flashResult!.quick_wins.map((win, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{win.title}</h4>
                      <Badge variant="secondary">{win.eta_days}d</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{win.why}</p>
                    <div className="flex justify-between items-center text-xs">
                      <Badge variant="outline">{win.owner_role}</Badge>
                      <span className="text-muted-foreground">{win.engine}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Brakes (Full Audit only) */}
        {isFullAudit && auditResult!.brakes.flags.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-5 w-5" />
                <span>Brakes - Risk Level: {auditResult!.brakes.risk_level.toUpperCase()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Risk Flags</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {auditResult!.brakes.flags.map((flag, index) => (
                      <li key={index}>{flag}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Controls</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {auditResult!.brakes.controls.map((control, index) => (
                      <li key={index}>{control}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Section */}
        <Card data-tour="export">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export & Tools</span>
            </CardTitle>
            <CardDescription>
              Export your data to Excel or Google Sheets, or use structured meeting templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Individual Exports */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Individual Exports</h4>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => exportCSV('actions')}
                    disabled={!hasActions}
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Actions CSV
                  </Button>
                  <Button
                    onClick={() => exportCSV('goals')}
                    variant="outline"
                    disabled={!hasGoals}
                    size="sm"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Goals CSV
                  </Button>
                  <Button
                    onClick={() => exportCSV('meetings')}
                    variant="outline"
                    size="sm"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Meeting Templates
                  </Button>
                </div>
              </div>

              {/* Combined Exports */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Complete Exports</h4>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => exportCSV('combined')}
                    variant="outline"
                    size="sm"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    All Data (Combined)
                  </Button>
                  <Button
                    onClick={() => exportCSV('excel')}
                    variant="outline"
                    size="sm"
                  >
                    <Table className="h-4 w-4 mr-2" />
                    Excel Ready Format
                  </Button>
                  <Button
                    onClick={exportDataBackup}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Data Backup
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t">
              <Link href="/import">
                <Button variant="outline" size="sm">
                  Import Data
                </Button>
              </Link>
              <Link href="/meetings">
                <Button variant="outline" size="sm">
                  Meeting Templates
                </Button>
              </Link>
            </div>
            <div className="pt-2 border-t">
              <Button
                onClick={clearAllData}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                {isDemoMode ? 'Exit Demo Mode' : 'Reset All Data'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Prompt (Flash Scan only) */}
        {!isFullAudit && (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Want Complete Analysis?</CardTitle>
              <CardDescription>
                Get detailed engine scoring, risk assessment, and enhanced reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/full-audit">
                <Button size="lg">Upgrade to Full Audit</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
