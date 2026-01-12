'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Database, 
  Play, 
  Activity,
  Download,
  Trash2,
  RotateCcw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

type ThemeOption = 'light' | 'dark' | 'system' | 'midnight-racing' | 'sunrise' | 'sunrise-dark'

interface ThemeConfig {
  id: ThemeOption
  name: string
  icon: React.ReactNode
  description: string
}

const themes: ThemeConfig[] = [
  { id: 'light', name: 'Light', icon: <Sun className="h-4 w-4" />, description: 'Clean, bright interface' },
  { id: 'dark', name: 'Dark', icon: <Moon className="h-4 w-4" />, description: 'Easy on the eyes' },
  { id: 'system', name: 'System', icon: <Monitor className="h-4 w-4" />, description: 'Match your device' },
  { id: 'midnight-racing', name: 'Midnight Racing', icon: <Palette className="h-4 w-4" />, description: 'Electric blue accents' },
  { id: 'sunrise', name: 'Sunrise', icon: <Sun className="h-4 w-4" />, description: 'Warm orange & gold' },
  { id: 'sunrise-dark', name: 'Sunrise Dark', icon: <Moon className="h-4 w-4" />, description: 'Dark with warm accents' },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [dataStats, setDataStats] = useState({
    hasFlashScan: false,
    hasFullAudit: false,
    hasYearBoard: false,
    hasImportedActions: false,
    hasImportedGoals: false,
    hasMeetingHistory: false
  })
  const [exportSuccess, setExportSuccess] = useState(false)
  const [clearSuccess, setClearSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check demo mode
    setIsDemoMode(localStorage.getItem('demo-mode') === 'true')
    
    // Check data presence
    setDataStats({
      hasFlashScan: !!localStorage.getItem('flash-scan-result'),
      hasFullAudit: !!localStorage.getItem('full-audit-result'),
      hasYearBoard: !!localStorage.getItem('year-board-plan'),
      hasImportedActions: !!localStorage.getItem('imported-actions'),
      hasImportedGoals: !!localStorage.getItem('imported-goals'),
      hasMeetingHistory: !!localStorage.getItem('meeting-history')
    })
  }, [])

  const handleThemeChange = (newTheme: ThemeOption) => {
    // For custom themes, we need to handle them differently
    if (['midnight-racing', 'sunrise', 'sunrise-dark'].includes(newTheme)) {
      document.documentElement.classList.remove('light', 'dark', 'midnight-racing', 'sunrise', 'sunrise-dark')
      document.documentElement.classList.add(newTheme)
      setTheme(newTheme)
    } else {
      document.documentElement.classList.remove('midnight-racing', 'sunrise', 'sunrise-dark')
      setTheme(newTheme)
    }
  }

  const exportAllData = () => {
    try {
      const allData: Record<string, string | null> = {}
      const keys = [
        'flash-scan-result', 'full-audit-result', 'year-board-plan',
        'imported-actions', 'imported-goals', 'meeting-history',
        'engine-history', 'action-status'
      ]
      
      keys.forEach(key => {
        const value = localStorage.getItem(key)
        if (value) allData[key] = value
      })

      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `driveros-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data')
    }
  }

  const clearAllData = () => {
    if (confirm('This will permanently delete ALL your data. This cannot be undone. Continue?')) {
      const keys = [
        'flash-scan-result', 'full-audit-result', 'year-board-plan',
        'imported-actions', 'imported-goals', 'meeting-history',
        'engine-history', 'action-status', 'demo-mode', 'demo-backup',
        'demo-tour-completed'
      ]
      
      keys.forEach(key => localStorage.removeItem(key))
      
      setClearSuccess(true)
      setTimeout(() => {
        setClearSuccess(false)
        window.location.reload()
      }, 1500)
    }
  }

  const toggleDemoMode = () => {
    if (isDemoMode) {
      // Exit demo mode
      const backup = localStorage.getItem('demo-backup')
      if (backup) {
        try {
          const backupData = JSON.parse(backup)
          Object.entries(backupData).forEach(([key, value]) => {
            if (value) localStorage.setItem(key, value as string)
          })
          localStorage.removeItem('demo-backup')
        } catch (error) {
          console.error('Failed to restore backup:', error)
        }
      }
      localStorage.removeItem('demo-mode')
      localStorage.removeItem('demo-tour-completed')
      localStorage.removeItem('full-audit-result')
      window.location.href = '/dashboard'
    } else {
      // Enter demo mode - redirect to landing to use proper demo initialization
      window.location.href = '/'
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading settings...</div>
      </div>
    )
  }

  const dataCount = Object.values(dataStats).filter(Boolean).length

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your DriverOS experience
        </p>
      </div>

      {/* Theme Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme
          </CardTitle>
          <CardDescription>
            Choose your preferred color scheme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  theme === t.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {t.icon}
                  <span className="font-medium">{t.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t.description}</p>
                {theme === t.id && (
                  <Badge className="mt-2" variant="default">Active</Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, or clear your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Status */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-3">Current Data Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {dataStats.hasFlashScan ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                )}
                <span>Flash Scan</span>
              </div>
              <div className="flex items-center gap-2">
                {dataStats.hasFullAudit ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                )}
                <span>Full Audit</span>
              </div>
              <div className="flex items-center gap-2">
                {dataStats.hasYearBoard ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                )}
                <span>Year Board</span>
              </div>
              <div className="flex items-center gap-2">
                {dataStats.hasImportedActions ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                )}
                <span>Imported Actions</span>
              </div>
              <div className="flex items-center gap-2">
                {dataStats.hasImportedGoals ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                )}
                <span>Imported Goals</span>
              </div>
              <div className="flex items-center gap-2">
                {dataStats.hasMeetingHistory ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                )}
                <span>Meeting History</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {dataCount} of 6 data sources active
            </p>
          </div>

          {/* Data Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={exportAllData} variant="outline" disabled={dataCount === 0}>
              <Download className="h-4 w-4 mr-2" />
              {exportSuccess ? 'Exported!' : 'Export All Data'}
            </Button>
            <Button 
              onClick={clearAllData} 
              variant="outline" 
              className="text-destructive hover:text-destructive"
              disabled={dataCount === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {clearSuccess ? 'Cleared!' : 'Clear All Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demo Mode Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Demo Mode
          </CardTitle>
          <CardDescription>
            Explore DriverOS with sample data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Demo Mode</span>
                {isDemoMode && (
                  <Badge variant="default" className="bg-orange-500">Active</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isDemoMode 
                  ? 'You\'re viewing sample data. Your real data is safely backed up.'
                  : 'Launch demo mode to explore all features with sample data.'}
              </p>
            </div>
            <Button onClick={toggleDemoMode} variant={isDemoMode ? 'outline' : 'default'}>
              {isDemoMode ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Exit Demo
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Demo
                </>
              )}
            </Button>
          </div>
          {isDemoMode && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
              <p className="text-orange-800 dark:text-orange-200">
                Demo mode is active. Changes won't affect your real data. Exit demo mode to return to your workspace.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance
          </CardTitle>
          <CardDescription>
            System health and performance monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Monitor system performance, track operation times, and view error logs.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/performance'}>
              <Activity className="h-4 w-4 mr-2" />
              View Performance Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
