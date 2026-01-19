'use client'

import { useEffect, useState } from 'react'
import { useDataMigration } from '@/hooks/useDataMigration'

interface MigrationProviderProps {
  children: React.ReactNode
}

/**
 * MigrationProvider
 *
 * Wraps the app and handles data migrations on startup.
 * Shows a brief loading state while checking/running migrations.
 * Auto-runs migrations if needed to ensure data compatibility.
 */
export function MigrationProvider({ children }: MigrationProviderProps) {
  const [isReady, setIsReady] = useState(false)

  const {
    isChecking,
    isMigrating,
    migrationNeeded,
    migrate,
    lastResult,
    error
  } = useDataMigration({
    onMigrationComplete: (result) => {
      if (result.migrationsRun.length > 0) {
        console.log(
          `[Migration] Completed ${result.migrationsRun.length} migration(s):`,
          result.migrationsRun.join(', ')
        )
      }
    },
    onMigrationError: (err) => {
      console.error('[Migration] Failed:', err.message)
    }
  })

  // Auto-run migrations when needed
  useEffect(() => {
    if (!isChecking && migrationNeeded && !isMigrating) {
      migrate()
    }
  }, [isChecking, migrationNeeded, isMigrating, migrate])

  // Mark as ready when check complete and no migration needed/running
  useEffect(() => {
    if (!isChecking && !isMigrating) {
      setIsReady(true)
    }
  }, [isChecking, isMigrating])

  // Show loading state during migration check/execution
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">
            {isMigrating ? 'Updating data...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  // Show error state if migration failed (but still render children)
  if (error && lastResult && !lastResult.success) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 bg-destructive/10 border-b border-destructive p-2 z-50">
          <p className="text-sm text-destructive text-center">
            Data migration failed. Some features may not work correctly.
            <button
              onClick={() => window.location.reload()}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </p>
        </div>
        <div className="pt-10">{children}</div>
      </>
    )
  }

  return <>{children}</>
}
