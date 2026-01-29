'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  needsMigration,
  runMigrations,
  getStoredSchemaVersion,
  CURRENT_SCHEMA_VERSION,
  getMigrationMeta,
  getBackup,
  restoreBackup,
  clearBackup,
  MigrationResult,
  MigrationMeta,
  MigrationBackup
} from '@/lib/data-migration'

export interface MigrationState {
  /** Whether migration check is in progress */
  isChecking: boolean
  /** Whether migrations are currently running */
  isMigrating: boolean
  /** Whether migrations are needed */
  migrationNeeded: boolean
  /** Current stored schema version */
  storedVersion: string | null
  /** Target schema version */
  targetVersion: string
  /** Result of the last migration run */
  lastResult: MigrationResult | null
  /** Any error that occurred */
  error: Error | null
  /** Migration metadata */
  meta: MigrationMeta | null
  /** Available backup for rollback */
  backup: MigrationBackup | null
}

export interface UseMigrationReturn extends MigrationState {
  /** Run pending migrations */
  migrate: () => Promise<MigrationResult>
  /** Restore from backup (rollback) */
  rollback: () => boolean
  /** Dismiss backup (clear rollback option) */
  dismissBackup: () => void
  /** Re-check migration status */
  checkMigration: () => void
}

/**
 * React hook for data migration management
 *
 * Automatically checks for pending migrations on mount.
 * Provides methods to run migrations and rollback if needed.
 *
 * Usage:
 * ```tsx
 * function App() {
 *   const { migrationNeeded, isMigrating, migrate, error } = useDataMigration()
 *
 *   useEffect(() => {
 *     if (migrationNeeded) {
 *       migrate()
 *     }
 *   }, [migrationNeeded, migrate])
 *
 *   if (isMigrating) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *   return <MainApp />
 * }
 * ```
 */
export function useDataMigration(options?: {
  /** Auto-run migrations if needed (default: false) */
  autoMigrate?: boolean
  /** Callback when migration completes */
  onMigrationComplete?: (result: MigrationResult) => void
  /** Callback when migration fails */
  onMigrationError?: (error: Error) => void
}): UseMigrationReturn {
  const { autoMigrate = false, onMigrationComplete, onMigrationError } = options || {}

  const [state, setState] = useState<MigrationState>({
    isChecking: true,
    isMigrating: false,
    migrationNeeded: false,
    storedVersion: null,
    targetVersion: CURRENT_SCHEMA_VERSION,
    lastResult: null,
    error: null,
    meta: null,
    backup: null
  })

  // Check migration status
  const checkMigration = useCallback(() => {
    setState((prev) => ({ ...prev, isChecking: true, error: null }))

    try {
      const storedVersion = getStoredSchemaVersion()
      const migrationNeeded = needsMigration()
      const meta = getMigrationMeta()
      const backup = getBackup()

      setState((prev) => ({
        ...prev,
        isChecking: false,
        migrationNeeded,
        storedVersion,
        meta,
        backup
      }))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check migration status')
      setState((prev) => ({
        ...prev,
        isChecking: false,
        error
      }))
    }
  }, [])

  // Run migrations
  const migrate = useCallback(async (): Promise<MigrationResult> => {
    setState((prev) => ({ ...prev, isMigrating: true, error: null }))

    try {
      const result = runMigrations()

      setState((prev) => ({
        ...prev,
        isMigrating: false,
        migrationNeeded: false,
        storedVersion: result.toVersion,
        lastResult: result,
        meta: getMigrationMeta(),
        backup: getBackup()
      }))

      if (result.success) {
        onMigrationComplete?.(result)
      } else {
        const error = new Error(result.errors.join('; '))
        onMigrationError?.(error)
        setState((prev) => ({ ...prev, error }))
      }

      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Migration failed')
      setState((prev) => ({
        ...prev,
        isMigrating: false,
        error
      }))
      onMigrationError?.(error)
      throw error
    }
  }, [onMigrationComplete, onMigrationError])

  // Rollback to backup
  const rollback = useCallback((): boolean => {
    const success = restoreBackup()
    if (success) {
      checkMigration()
    }
    return success
  }, [checkMigration])

  // Dismiss backup
  const dismissBackup = useCallback(() => {
    clearBackup()
    setState((prev) => ({ ...prev, backup: null }))
  }, [])

  // Check on mount
  useEffect(() => {
    checkMigration()
  }, [checkMigration])

  // Auto-migrate if enabled
  useEffect(() => {
    if (autoMigrate && state.migrationNeeded && !state.isMigrating && !state.isChecking) {
      migrate()
    }
  }, [autoMigrate, state.migrationNeeded, state.isMigrating, state.isChecking, migrate])

  return {
    ...state,
    migrate,
    rollback,
    dismissBackup,
    checkMigration
  }
}

/**
 * Hook to check if app data needs migration on startup
 * Simpler version that just returns boolean status
 */
export function useMigrationStatus(): {
  isChecking: boolean
  needsMigration: boolean
  currentVersion: string
  storedVersion: string | null
} {
  const [isChecking, setIsChecking] = useState(true)
  const [migrationNeeded, setMigrationNeeded] = useState(false)
  const [storedVersion, setStoredVersion] = useState<string | null>(null)

  useEffect(() => {
    setIsChecking(true)
    try {
      setStoredVersion(getStoredSchemaVersion())
      setMigrationNeeded(needsMigration())
    } finally {
      setIsChecking(false)
    }
  }, [])

  return {
    isChecking,
    needsMigration: migrationNeeded,
    currentVersion: CURRENT_SCHEMA_VERSION,
    storedVersion
  }
}
