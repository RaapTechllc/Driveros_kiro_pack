/**
 * Data Migration System Tests
 *
 * Tests for schema version comparison, migration registration,
 * backup/restore, and migration execution.
 */

import {
  compareVersions,
  registerMigration,
  clearMigrations,
  getMigrations,
  needsMigration,
  getMigrationsToRun,
  runMigrations,
  createBackup,
  restoreBackup,
  clearBackup,
  getBackup,
  getStoredSchemaVersion,
  getMigrationMeta,
  CURRENT_SCHEMA_VERSION,
  MigrationFn
} from '../lib/data-migration'
import { STORAGE_KEYS } from '../lib/storage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Data Migration System', () => {
  beforeEach(() => {
    // Clear localStorage and migrations before each test
    localStorageMock.clear()
    clearMigrations()
    jest.clearAllMocks()
  })

  describe('compareVersions', () => {
    it('returns 0 for equal versions', () => {
      expect(compareVersions('1.0', '1.0')).toBe(0)
      expect(compareVersions('2.1.3', '2.1.3')).toBe(0)
    })

    it('returns -1 when first version is lower', () => {
      expect(compareVersions('1.0', '1.1')).toBe(-1)
      expect(compareVersions('1.0', '2.0')).toBe(-1)
      expect(compareVersions('1.9', '2.0')).toBe(-1)
      expect(compareVersions('1.0.0', '1.0.1')).toBe(-1)
    })

    it('returns 1 when first version is higher', () => {
      expect(compareVersions('1.1', '1.0')).toBe(1)
      expect(compareVersions('2.0', '1.9')).toBe(1)
      expect(compareVersions('1.0.1', '1.0.0')).toBe(1)
    })

    it('handles versions with different segment counts', () => {
      expect(compareVersions('1.0', '1.0.0')).toBe(0)
      expect(compareVersions('1.0', '1.0.1')).toBe(-1)
      expect(compareVersions('1.0.1', '1.0')).toBe(1)
    })
  })

  describe('registerMigration', () => {
    it('registers a migration', () => {
      const migration = {
        id: 'test-migration',
        fromVersion: '1.0',
        toVersion: '1.1',
        description: 'Test migration',
        migrate: (data: Record<string, unknown>) => data
      }

      registerMigration(migration)
      const migrations = getMigrations()

      expect(migrations).toHaveLength(1)
      expect(migrations[0].id).toBe('test-migration')
    })

    it('maintains migrations in version order', () => {
      registerMigration({
        id: 'v1.1-to-v1.2',
        fromVersion: '1.1',
        toVersion: '1.2',
        description: 'Second',
        migrate: (data) => data
      })

      registerMigration({
        id: 'v1.0-to-v1.1',
        fromVersion: '1.0',
        toVersion: '1.1',
        description: 'First',
        migrate: (data) => data
      })

      const migrations = getMigrations()
      expect(migrations[0].id).toBe('v1.0-to-v1.1')
      expect(migrations[1].id).toBe('v1.1-to-v1.2')
    })
  })

  describe('clearMigrations', () => {
    it('removes all registered migrations', () => {
      registerMigration({
        id: 'test',
        fromVersion: '1.0',
        toVersion: '1.1',
        description: 'Test',
        migrate: (data) => data
      })

      expect(getMigrations()).toHaveLength(1)
      clearMigrations()
      expect(getMigrations()).toHaveLength(0)
    })
  })

  describe('getStoredSchemaVersion', () => {
    it('returns null when no data exists', () => {
      expect(getStoredSchemaVersion()).toBeNull()
    })

    it('returns version from full audit result', () => {
      localStorageMock.setItem(
        STORAGE_KEYS.FULL_AUDIT_RESULT,
        JSON.stringify({ schema_version: '1.0' })
      )
      expect(getStoredSchemaVersion()).toBe('1.0')
    })

    it('returns version from flash scan result', () => {
      localStorageMock.setItem(
        STORAGE_KEYS.FLASH_SCAN_RESULT,
        JSON.stringify({ schema_version: '0.9' })
      )
      expect(getStoredSchemaVersion()).toBe('0.9')
    })

    it('prefers full audit version over flash scan', () => {
      localStorageMock.setItem(
        STORAGE_KEYS.FULL_AUDIT_RESULT,
        JSON.stringify({ schema_version: '1.0' })
      )
      localStorageMock.setItem(
        STORAGE_KEYS.FLASH_SCAN_RESULT,
        JSON.stringify({ schema_version: '0.9' })
      )
      expect(getStoredSchemaVersion()).toBe('1.0')
    })
  })

  describe('needsMigration', () => {
    it('returns false when no data exists', () => {
      expect(needsMigration()).toBe(false)
    })

    it('returns false when at current version', () => {
      localStorageMock.setItem(
        STORAGE_KEYS.FULL_AUDIT_RESULT,
        JSON.stringify({ schema_version: CURRENT_SCHEMA_VERSION })
      )
      expect(needsMigration()).toBe(false)
    })

    it('returns true when stored version is older', () => {
      localStorageMock.setItem(
        STORAGE_KEYS.FULL_AUDIT_RESULT,
        JSON.stringify({ schema_version: '0.1' })
      )
      expect(needsMigration()).toBe(true)
    })
  })

  describe('getMigrationsToRun', () => {
    beforeEach(() => {
      registerMigration({
        id: 'v1.0-to-v1.1',
        fromVersion: '1.0',
        toVersion: '1.1',
        description: 'First',
        migrate: (data) => data
      })
      registerMigration({
        id: 'v1.1-to-v1.2',
        fromVersion: '1.1',
        toVersion: '1.2',
        description: 'Second',
        migrate: (data) => data
      })
      registerMigration({
        id: 'v1.2-to-v2.0',
        fromVersion: '1.2',
        toVersion: '2.0',
        description: 'Third',
        migrate: (data) => data
      })
    })

    it('returns all migrations between versions', () => {
      const migrations = getMigrationsToRun('1.0', '2.0')
      expect(migrations).toHaveLength(3)
    })

    it('returns subset of migrations', () => {
      const migrations = getMigrationsToRun('1.1', '2.0')
      expect(migrations).toHaveLength(2)
      expect(migrations[0].id).toBe('v1.1-to-v1.2')
    })

    it('returns empty array when no migrations needed', () => {
      const migrations = getMigrationsToRun('2.0', '2.0')
      expect(migrations).toHaveLength(0)
    })
  })

  describe('backup and restore', () => {
    const testData = {
      schema_version: '1.0',
      gear: { number: 3, label: 'Drive' }
    }

    beforeEach(() => {
      localStorageMock.setItem(STORAGE_KEYS.FULL_AUDIT_RESULT, JSON.stringify(testData))
    })

    it('creates a backup of all data', () => {
      const backup = createBackup()

      expect(backup).not.toBeNull()
      expect(backup?.version).toBe('1.0')
      expect(backup?.data[STORAGE_KEYS.FULL_AUDIT_RESULT]).toEqual(testData)
    })

    it('returns null when no data to backup', () => {
      localStorageMock.clear()
      const backup = createBackup()
      expect(backup).toBeNull()
    })

    it('restores data from backup', () => {
      createBackup()

      // Modify the data
      localStorageMock.setItem(
        STORAGE_KEYS.FULL_AUDIT_RESULT,
        JSON.stringify({ schema_version: '2.0', gear: { number: 5 } })
      )

      // Restore
      const success = restoreBackup()
      expect(success).toBe(true)

      // Verify restoration
      const restored = JSON.parse(localStorageMock.getItem(STORAGE_KEYS.FULL_AUDIT_RESULT)!)
      expect(restored).toEqual(testData)
    })

    it('returns false when no backup exists', () => {
      expect(restoreBackup()).toBe(false)
    })

    it('clears backup', () => {
      createBackup()
      expect(getBackup()).not.toBeNull()

      clearBackup()
      expect(getBackup()).toBeNull()
    })
  })

  describe('runMigrations', () => {
    it('returns success when no data exists', () => {
      const result = runMigrations()

      expect(result.success).toBe(true)
      expect(result.migrationsRun).toHaveLength(0)
    })

    it('returns success when at current version', () => {
      localStorageMock.setItem(
        STORAGE_KEYS.FULL_AUDIT_RESULT,
        JSON.stringify({ schema_version: CURRENT_SCHEMA_VERSION })
      )

      const result = runMigrations()

      expect(result.success).toBe(true)
      expect(result.migrationsRun).toHaveLength(0)
    })

    it('runs migrations and updates version', () => {
      // Set up old data
      localStorageMock.setItem(
        STORAGE_KEYS.FULL_AUDIT_RESULT,
        JSON.stringify({ schema_version: '0.9', data: 'old' })
      )

      // Register a migration
      const migrateFn: MigrationFn = (data) => {
        const auditResult = data[STORAGE_KEYS.FULL_AUDIT_RESULT] as Record<string, unknown>
        if (auditResult) {
          auditResult.migrated = true
        }
        return data
      }

      registerMigration({
        id: 'v0.9-to-1.0',
        fromVersion: '0.9',
        toVersion: '1.0',
        description: 'Add migrated flag',
        migrate: migrateFn
      })

      const result = runMigrations()

      expect(result.success).toBe(true)
      expect(result.migrationsRun).toContain('v0.9-to-1.0')

      // Verify data was migrated
      const migrated = JSON.parse(localStorageMock.getItem(STORAGE_KEYS.FULL_AUDIT_RESULT)!)
      expect(migrated.migrated).toBe(true)
      expect(migrated.schema_version).toBe(CURRENT_SCHEMA_VERSION)
    })

    it('restores backup on migration failure', () => {
      const originalData = { schema_version: '0.9', data: 'original' }
      localStorageMock.setItem(STORAGE_KEYS.FULL_AUDIT_RESULT, JSON.stringify(originalData))

      // Register a failing migration
      registerMigration({
        id: 'failing-migration',
        fromVersion: '0.9',
        toVersion: '1.0',
        description: 'This will fail',
        migrate: () => {
          throw new Error('Migration failed!')
        }
      })

      const result = runMigrations()

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('Migration failed!')

      // Verify backup was restored
      const restored = JSON.parse(localStorageMock.getItem(STORAGE_KEYS.FULL_AUDIT_RESULT)!)
      expect(restored).toEqual(originalData)
    })

    it('saves migration metadata', () => {
      localStorageMock.setItem(
        STORAGE_KEYS.FULL_AUDIT_RESULT,
        JSON.stringify({ schema_version: '0.9' })
      )

      registerMigration({
        id: 'test-migration',
        fromVersion: '0.9',
        toVersion: '1.0',
        description: 'Test',
        migrate: (data) => data
      })

      runMigrations()

      const meta = getMigrationMeta()
      expect(meta.lastVersion).toBe(CURRENT_SCHEMA_VERSION)
      expect(meta.lastMigrationAt).not.toBeNull()
      expect(meta.migrationsRun).toContain('test-migration')
    })
  })
})
