/**
 * Data Migration System
 *
 * Handles schema version upgrades for localStorage data.
 * Supports step-by-step migrations with rollback capability.
 *
 * Usage:
 * 1. Register migrations using registerMigration()
 * 2. Call runMigrations() on app startup
 * 3. Use useDataMigration hook for React integration
 */

import { safeGetItem, safeSetItem, safeRemoveItem, STORAGE_KEYS } from './storage'

// Current schema version - increment when making breaking changes
export const CURRENT_SCHEMA_VERSION = '1.0'

// Storage key for migration metadata
const MIGRATION_META_KEY = 'migration-meta'
const MIGRATION_BACKUP_KEY = 'migration-backup'

export interface MigrationMeta {
  lastVersion: string
  lastMigrationAt: string | null
  migrationsRun: string[]
}

export interface MigrationResult {
  success: boolean
  fromVersion: string
  toVersion: string
  migrationsRun: string[]
  errors: string[]
}

export interface MigrationBackup {
  timestamp: string
  version: string
  data: Record<string, unknown>
}

/**
 * Migration function signature
 * Receives the data to migrate and returns the migrated data
 * Should throw an error if migration fails
 */
export type MigrationFn = (data: Record<string, unknown>) => Record<string, unknown>

interface Migration {
  id: string
  fromVersion: string
  toVersion: string
  description: string
  migrate: MigrationFn
}

// Registry of all migrations (ordered by version)
const migrations: Migration[] = []

/**
 * Register a migration
 * Migrations are run in order based on fromVersion → toVersion
 */
export function registerMigration(migration: Migration): void {
  // Insert in order based on version
  const insertIndex = migrations.findIndex(
    (m) => compareVersions(m.fromVersion, migration.fromVersion) > 0
  )
  if (insertIndex === -1) {
    migrations.push(migration)
  } else {
    migrations.splice(insertIndex, 0, migration)
  }
}

/**
 * Clear all registered migrations (useful for testing)
 */
export function clearMigrations(): void {
  migrations.length = 0
}

/**
 * Get all registered migrations
 */
export function getMigrations(): Migration[] {
  return [...migrations]
}

/**
 * Compare semantic versions (e.g., "1.0" vs "1.1")
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number)
  const partsB = b.split('.').map(Number)

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0
    const numB = partsB[i] || 0
    if (numA < numB) return -1
    if (numA > numB) return 1
  }
  return 0
}

/**
 * Get the current schema version from stored data
 * Returns null if no data exists
 */
export function getStoredSchemaVersion(): string | null {
  // Check multiple data sources for version
  const auditResult = safeGetItem<{ schema_version?: string } | null>(
    STORAGE_KEYS.FULL_AUDIT_RESULT,
    null
  )
  if (auditResult?.schema_version) {
    return auditResult.schema_version
  }

  const flashResult = safeGetItem<{ schema_version?: string } | null>(
    STORAGE_KEYS.FLASH_SCAN_RESULT,
    null
  )
  if (flashResult?.schema_version) {
    return flashResult.schema_version
  }

  // Check migration meta for last known version
  const meta = getMigrationMeta()
  if (meta.lastVersion) {
    return meta.lastVersion
  }

  return null
}

/**
 * Get migration metadata
 */
export function getMigrationMeta(): MigrationMeta {
  return safeGetItem<MigrationMeta>(MIGRATION_META_KEY, {
    lastVersion: '',
    lastMigrationAt: null,
    migrationsRun: []
  })
}

/**
 * Save migration metadata
 */
function saveMigrationMeta(meta: MigrationMeta): void {
  safeSetItem(MIGRATION_META_KEY, meta)
}

/**
 * Check if migrations are needed
 */
export function needsMigration(): boolean {
  const storedVersion = getStoredSchemaVersion()

  // No stored data - no migration needed
  if (!storedVersion) {
    return false
  }

  // Compare stored version with current
  return compareVersions(storedVersion, CURRENT_SCHEMA_VERSION) < 0
}

/**
 * Get migrations needed to go from one version to another
 */
export function getMigrationsToRun(fromVersion: string, toVersion: string): Migration[] {
  return migrations.filter((m) => {
    const afterFrom = compareVersions(m.fromVersion, fromVersion) >= 0
    const beforeTo = compareVersions(m.toVersion, toVersion) <= 0
    return afterFrom && beforeTo
  })
}

/**
 * Create a backup of all app data
 */
export function createBackup(): MigrationBackup | null {
  const backup: Record<string, unknown> = {}

  // Backup all known storage keys
  const keysToBackup = [
    STORAGE_KEYS.FLASH_SCAN_RESULT,
    STORAGE_KEYS.FULL_AUDIT_RESULT,
    STORAGE_KEYS.IMPORTED_ACTIONS,
    STORAGE_KEYS.IMPORTED_GOALS,
    STORAGE_KEYS.ACTION_STATUSES,
    STORAGE_KEYS.TEAM_ROSTER,
    STORAGE_KEYS.ENGINE_HISTORY,
    STORAGE_KEYS.YEAR_PLAN,
    STORAGE_KEYS.YEAR_ITEMS,
    STORAGE_KEYS.APEX_AUDIT_RESULT
  ]

  for (const key of keysToBackup) {
    const data = safeGetItem<unknown>(key, null)
    if (data !== null) {
      backup[key] = data
    }
  }

  // Only create backup if there's data
  if (Object.keys(backup).length === 0) {
    return null
  }

  const backupData: MigrationBackup = {
    timestamp: new Date().toISOString(),
    version: getStoredSchemaVersion() || 'unknown',
    data: backup
  }

  safeSetItem(MIGRATION_BACKUP_KEY, backupData)
  return backupData
}

/**
 * Restore from backup
 */
export function restoreBackup(): boolean {
  const backup = safeGetItem<MigrationBackup | null>(MIGRATION_BACKUP_KEY, null)

  if (!backup?.data) {
    return false
  }

  // Restore each key
  for (const [key, value] of Object.entries(backup.data)) {
    if (value !== null && value !== undefined) {
      safeSetItem(key, value)
    }
  }

  return true
}

/**
 * Clear the migration backup
 */
export function clearBackup(): void {
  safeRemoveItem(MIGRATION_BACKUP_KEY)
}

/**
 * Get the current backup if it exists
 */
export function getBackup(): MigrationBackup | null {
  return safeGetItem<MigrationBackup | null>(MIGRATION_BACKUP_KEY, null)
}

/**
 * Run all pending migrations
 */
export function runMigrations(): MigrationResult {
  const result: MigrationResult = {
    success: true,
    fromVersion: '',
    toVersion: CURRENT_SCHEMA_VERSION,
    migrationsRun: [],
    errors: []
  }

  const storedVersion = getStoredSchemaVersion()

  // No stored data - nothing to migrate
  if (!storedVersion) {
    return result
  }

  result.fromVersion = storedVersion

  // Already at current version
  if (compareVersions(storedVersion, CURRENT_SCHEMA_VERSION) >= 0) {
    return result
  }

  // Get migrations to run
  const migrationsToRun = getMigrationsToRun(storedVersion, CURRENT_SCHEMA_VERSION)

  if (migrationsToRun.length === 0) {
    // No registered migrations but version mismatch
    // Just update the version in stored data
    updateStoredVersions(CURRENT_SCHEMA_VERSION)
    return result
  }

  // Create backup before migrating
  createBackup()

  // Collect all data to migrate
  let allData = collectAllData()

  // Run each migration in order
  for (const migration of migrationsToRun) {
    try {
      allData = migration.migrate(allData)
      result.migrationsRun.push(migration.id)
    } catch (error) {
      result.success = false
      result.errors.push(
        `Migration ${migration.id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      // Restore backup on failure
      restoreBackup()
      return result
    }
  }

  // Save migrated data
  saveAllData(allData)

  // Update version in stored data
  updateStoredVersions(CURRENT_SCHEMA_VERSION)

  // Save migration metadata
  const meta = getMigrationMeta()
  saveMigrationMeta({
    lastVersion: CURRENT_SCHEMA_VERSION,
    lastMigrationAt: new Date().toISOString(),
    migrationsRun: [...meta.migrationsRun, ...result.migrationsRun]
  })

  // Clear backup on success
  clearBackup()

  return result
}

/**
 * Collect all app data into a single object
 */
function collectAllData(): Record<string, unknown> {
  const data: Record<string, unknown> = {}

  const keysToCollect = [
    STORAGE_KEYS.FLASH_SCAN_RESULT,
    STORAGE_KEYS.FULL_AUDIT_RESULT,
    STORAGE_KEYS.IMPORTED_ACTIONS,
    STORAGE_KEYS.IMPORTED_GOALS,
    STORAGE_KEYS.ACTION_STATUSES,
    STORAGE_KEYS.TEAM_ROSTER,
    STORAGE_KEYS.ENGINE_HISTORY,
    STORAGE_KEYS.YEAR_PLAN,
    STORAGE_KEYS.YEAR_ITEMS,
    STORAGE_KEYS.APEX_AUDIT_RESULT
  ]

  for (const key of keysToCollect) {
    const value = safeGetItem<unknown>(key, null)
    if (value !== null) {
      data[key] = value
    }
  }

  return data
}

/**
 * Save all app data from a single object
 */
function saveAllData(data: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      safeSetItem(key, value)
    }
  }
}

/**
 * Update schema_version in all stored data
 */
function updateStoredVersions(version: string): void {
  // Update full audit result
  const auditResult = safeGetItem<Record<string, unknown> | null>(
    STORAGE_KEYS.FULL_AUDIT_RESULT,
    null
  )
  if (auditResult) {
    auditResult.schema_version = version
    safeSetItem(STORAGE_KEYS.FULL_AUDIT_RESULT, auditResult)
  }

  // Update flash scan result
  const flashResult = safeGetItem<Record<string, unknown> | null>(
    STORAGE_KEYS.FLASH_SCAN_RESULT,
    null
  )
  if (flashResult) {
    flashResult.schema_version = version
    safeSetItem(STORAGE_KEYS.FLASH_SCAN_RESULT, flashResult)
  }

  // Update apex audit result
  const apexResult = safeGetItem<Record<string, unknown> | null>(
    STORAGE_KEYS.APEX_AUDIT_RESULT,
    null
  )
  if (apexResult) {
    apexResult.schema_version = version
    safeSetItem(STORAGE_KEYS.APEX_AUDIT_RESULT, apexResult)
  }
}

// ============================================================================
// Example Migrations (for future use)
// ============================================================================

// Example: Migration from 1.0 to 1.1
// registerMigration({
//   id: 'v1.0-to-v1.1',
//   fromVersion: '1.0',
//   toVersion: '1.1',
//   description: 'Add new field to audit results',
//   migrate: (data) => {
//     const auditResult = data[STORAGE_KEYS.FULL_AUDIT_RESULT] as Record<string, unknown>
//     if (auditResult) {
//       auditResult.newField = 'default value'
//       data[STORAGE_KEYS.FULL_AUDIT_RESULT] = auditResult
//     }
//     return data
//   }
// })
