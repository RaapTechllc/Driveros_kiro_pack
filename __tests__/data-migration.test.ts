import { dataMigration } from '../lib/data-migration'

// Enhanced localStorage mock that supports Object.keys()
const createMockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  const mock = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(key => delete store[key]) },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length },
    _getStore: () => ({ ...store })
  }
  
  // Make Object.keys(localStorage) work by returning store keys
  return new Proxy(mock, {
    ownKeys: () => Object.keys(store),
    getOwnPropertyDescriptor: (target, prop) => {
      if (prop in store) {
        return { enumerable: true, configurable: true, value: store[prop as string] }
      }
      return Object.getOwnPropertyDescriptor(target, prop)
    }
  })
}

const localStorageMock = createMockLocalStorage()

// Set up window and localStorage before importing modules
Object.defineProperty(global, 'window', {
  value: { localStorage: localStorageMock },
  writable: true
})
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

describe('Data Migration System', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('basic functionality', () => {
    it('should create and restore backups', () => {
      // Set up test data
      localStorage.setItem('test-key', '{"value": "test"}')
      localStorage.setItem('raw-key', 'raw-value')

      // Create backup
      const backup = dataMigration.createBackup()
      
      expect(backup.version).toBe('1.0')
      expect(backup.timestamp).toBeDefined()
      expect(backup.checksum).toBeDefined()
      expect(backup.data['test-key']).toEqual({ value: 'test' })
      expect(backup.data['raw-key']).toBe('raw-value')

      // Clear storage
      localStorage.clear()
      expect(localStorage.length).toBe(0)

      // Restore backup
      const result = dataMigration.restoreFromBackup(backup)
      
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(localStorage.getItem('test-key')).toBe('{"value":"test"}')
      expect(localStorage.getItem('raw-key')).toBe('raw-value')
    })

    it('should detect corrupted backups', () => {
      const corruptedBackup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: { 'test': 'data' },
        checksum: 'invalid-checksum'
      }

      const result = dataMigration.restoreFromBackup(corruptedBackup)
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Backup checksum verification failed')
    })

    it('should analyze data health', () => {
      localStorage.setItem('flash-scan-result', '{"valid": "json"}')
      localStorage.setItem('corrupted-data', 'invalid json {')

      const health = dataMigration.getDataHealth()

      expect(health.version).toBe('1.0')
      expect(health.totalKeys).toBe(2)
      expect(health.corruptedKeys).toContain('corrupted-data')
      expect(health.missingCriticalKeys).toContain('full-audit-result')
      expect(health.recommendations.length).toBeGreaterThan(0)
    })

    it('should clean up old data', () => {
      const oldTimestamp = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      
      localStorage.setItem('performance-old', 'old performance data')
      localStorage.setItem('temp-expired', `{"timestamp": "${oldTimestamp}"}`)
      localStorage.setItem('flash-scan-result', '{"keep": "this"}')

      const result = dataMigration.cleanupData()

      expect(result.removedKeys).toContain('performance-old')
      expect(result.removedKeys).toContain('temp-expired')
      expect(result.spaceSaved).toBeGreaterThan(0)
      expect(localStorage.getItem('flash-scan-result')).toBeTruthy()
    })

    it('should export and import JSON backups', () => {
      localStorage.setItem('export-test', '{"data": "value"}')

      const exported = dataMigration.exportBackup()
      const parsed = JSON.parse(exported)

      expect(parsed.version).toBe('1.0')
      expect(parsed.data['export-test']).toEqual({ data: 'value' })

      // Test import
      localStorage.clear()
      const importResult = dataMigration.importBackup(exported)

      expect(importResult.success).toBe(true)
      expect(localStorage.getItem('export-test')).toBe('{"data":"value"}')
    })

    it('should handle invalid JSON imports', () => {
      const result = dataMigration.importBackup('invalid json')

      expect(result.success).toBe(false)
      expect(result.errors[0]).toContain('Invalid backup format')
    })

    it('should migrate data to current version', () => {
      localStorage.setItem('flash-scan-result', '{"gear": 3}')

      const result = dataMigration.migrateToCurrentVersion()

      expect(result.success).toBe(true)
      expect(result.fromVersion).toBe('1.0')
      expect(result.toVersion).toBe('1.0')
      expect(result.errors).toHaveLength(0)
    })
  })
})
