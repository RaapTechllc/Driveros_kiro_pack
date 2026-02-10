'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { FullAuditResult } from '@/lib/full-audit-analysis'
import { FlashScanResult } from '@/lib/types'
import { loadImportedActions, loadImportedGoals, transformImportedActions, transformImportedGoals } from '@/lib/imported-data'
import { getEngineHistory, calcTrend, TrendDirection } from '@/lib/engine-history'
import { safeGetItem, STORAGE_KEYS } from '@/lib/storage'
import { dashboardLogger } from '@/lib/logger'

/**
 * Hook to load and manage Full Audit result
 */
export function useAuditResult() {
  const [auditResult, setAuditResult] = useState<FullAuditResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    try {
      const savedAudit = safeGetItem<FullAuditResult | null>(STORAGE_KEYS.FULL_AUDIT_RESULT, null)

      if (savedAudit && savedAudit.schema_version === '1.0') {
        setAuditResult(savedAudit)
        dashboardLogger.debug('Loaded audit result', { gear: savedAudit.gear.number })
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load audit result')
      setError(error)
      dashboardLogger.error('Failed to load audit result', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { auditResult, setAuditResult, isLoading, error }
}

/**
 * Hook to load and manage Flash Scan result
 */
export function useFlashResult() {
  const [flashResult, setFlashResult] = useState<FlashScanResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    try {
      const savedFlash = safeGetItem<FlashScanResult | null>(STORAGE_KEYS.FLASH_SCAN_RESULT, null)

      if (savedFlash && savedFlash.schema_version === '1.0') {
        setFlashResult(savedFlash)
        dashboardLogger.debug('Loaded flash scan result')
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load flash result')
      setError(error)
      dashboardLogger.error('Failed to load flash result', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { flashResult, setFlashResult, isLoading, error }
}

/**
 * Hook to load imported actions
 */
export function useImportedActions() {
  const [importedActions, setImportedActions] = useState<ReturnType<typeof transformImportedActions>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    try {
      const actions = loadImportedActions()
      setImportedActions(transformImportedActions(actions))
    } catch (err) {
      dashboardLogger.error('Failed to load imported actions', err)
      setImportedActions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { importedActions, setImportedActions, isLoading }
}

/**
 * Hook to load imported goals
 */
export function useImportedGoals() {
  const [importedGoals, setImportedGoals] = useState<ReturnType<typeof transformImportedGoals>>({
    northStar: undefined,
    departments: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    try {
      const goals = loadImportedGoals()
      setImportedGoals(transformImportedGoals(goals))
    } catch (err) {
      dashboardLogger.error('Failed to load imported goals', err)
      setImportedGoals({ northStar: undefined, departments: [] })
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { importedGoals, setImportedGoals, isLoading }
}

/**
 * Hook to calculate engine trends
 */
export function useEngineTrends(auditResult: FullAuditResult | null) {
  const engineTrends = useMemo(() => {
    if (!auditResult?.engines) {
      return {} as Record<string, TrendDirection>
    }

    const history = getEngineHistory()
    const trends: Record<string, TrendDirection> = {}

    auditResult.engines.forEach((engine) => {
      trends[engine.name] = calcTrend(engine.name, history)
    })

    return trends
  }, [auditResult])

  return engineTrends
}



/**
 * Combined hook for all dashboard data
 */
export function useDashboardData() {
  const { auditResult, setAuditResult, isLoading: auditLoading, error: auditError } = useAuditResult()
  const { flashResult, setFlashResult, isLoading: flashLoading, error: flashError } = useFlashResult()
  const { importedActions, isLoading: actionsLoading } = useImportedActions()
  const { importedGoals, isLoading: goalsLoading } = useImportedGoals()
  const engineTrends = useEngineTrends(auditResult)

  const isLoading = auditLoading || flashLoading || actionsLoading || goalsLoading
  const error = auditError || flashError

  const hasData = !!auditResult || !!flashResult
  const isFullAudit = !!auditResult
  const result = auditResult || flashResult

  return {
    // Data
    auditResult,
    flashResult,
    importedActions,
    importedGoals,
    engineTrends,

    // Setters
    setAuditResult,
    setFlashResult,

    // State
    isLoading,
    error,
    hasData,
    isFullAudit,
    result
  }
}
