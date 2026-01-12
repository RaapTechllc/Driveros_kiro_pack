/**
 * Data Migration & Backup System
 * 
 * Handles localStorage schema versioning, data migration, and backup/restore
 * operations for DriverOS. Ensures data integrity during schema changes.
 */

import { performanceMonitor } from './performance-monitor'

export interface DataBackup {
  version: string
  timestamp: string
  data: Record<string, any>
  checksum: string
}

export interface MigrationResult {
  success: boolean
  fromVersion: string
  toVersion: string
  migratedKeys: string[]
  errors: string[]
}

export interface SchemaVersion {
  version: string
  description: string
  migrationFn?: (data: Record<string, any>) => Record<string, any>
}

class DataMigrationSystem {
  private currentVersion = '1.0'
  private schemas: SchemaVersion[] = [
    {
      version: '1.0',
      description: 'Initial schema with flash-scan-result, full-audit-result, year-plan, year-items'
    }
  ]

  /**
   * Create a complete backup of localStorage data
   */
  createBackup(): DataBackup {
    return performanceMonitor.trackSync('data-backup', () => {
      const data: Record<string, any> = {}
      
      // Collect all localStorage data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          try {
            const value = localStorage.getItem(key)
            if (value) {
              data[key] = JSON.parse(value)
            }
          } catch (error) {
            // Store raw value if JSON parsing fails
            data[key] = localStorage.getItem(key)
          }
        }
      }
      
      const backup: DataBackup = {
        version: this.currentVersion,
        timestamp: new Date().toISOString(),
        data,
        checksum: this.calculateChecksum(data)
      }
      
      return backup
    }) as DataBackup
  }

  /**
   * Restore data from backup
   */
  restoreFromBackup(backup: DataBackup): { success: boolean; errors: string[] } {
    return performanceMonitor.trackSync('data-restore', () => {
      const errors: string[] = []
      
      // Verify checksum
      const calculatedChecksum = this.calculateChecksum(backup.data)
      if (calculatedChecksum !== backup.checksum) {
        errors.push('Backup checksum verification failed')
        return { success: false, errors }
      }
      
      // Clear existing data
      localStorage.clear()
      
      // Restore data
      for (const [key, value] of Object.entries(backup.data)) {
        try {
          const serializedValue = typeof value === 'string' ? value : JSON.stringify(value)
          localStorage.setItem(key, serializedValue)
        } catch (error) {
          errors.push(`Failed to restore key "${key}": ${error}`)
        }
      }
      
      return { success: errors.length === 0, errors }
    }) as { success: boolean; errors: string[] }
  }

  /**
   * Export backup as downloadable JSON
   */
  exportBackup(): string {
    const backup = this.createBackup()
    return JSON.stringify(backup, null, 2)
  }

  /**
   * Import backup from JSON string
   */
  importBackup(backupJson: string): { success: boolean; errors: string[] } {
    try {
      const backup: DataBackup = JSON.parse(backupJson)
      return this.restoreFromBackup(backup)
    } catch (error) {
      return {
        success: false,
        errors: [`Invalid backup format: ${error}`]
      }
    }
  }

  /**
   * Migrate data to current schema version
   */
  migrateToCurrentVersion(): MigrationResult {
    return performanceMonitor.trackSync('data-migration', () => {
      const currentData = this.getCurrentData()
      const currentDataVersion = this.detectDataVersion(currentData)
      
      if (currentDataVersion === this.currentVersion) {
        return {
          success: true,
          fromVersion: currentDataVersion,
          toVersion: this.currentVersion,
          migratedKeys: [],
          errors: []
        }
      }
      
      const errors: string[] = []
      const migratedKeys: string[] = []
      
      // Find migration path
      const fromIndex = this.schemas.findIndex(s => s.version === currentDataVersion)
      const toIndex = this.schemas.findIndex(s => s.version === this.currentVersion)
      
      if (fromIndex === -1) {
        errors.push(`Unknown current version: ${currentDataVersion}`)
        return {
          success: false,
          fromVersion: currentDataVersion,
          toVersion: this.currentVersion,
          migratedKeys: [],
          errors
        }
      }
      
      // Apply migrations in sequence
      let migratedData = { ...currentData }
      
      for (let i = fromIndex + 1; i <= toIndex; i++) {
        const schema = this.schemas[i]
        if (schema.migrationFn) {
          try {
            migratedData = schema.migrationFn(migratedData)
            migratedKeys.push(`migrated-to-${schema.version}`)
          } catch (error) {
            errors.push(`Migration to ${schema.version} failed: ${error}`)
          }
        }
      }
      
      // Save migrated data
      if (errors.length === 0) {
        this.saveData(migratedData)
      }
      
      return {
        success: errors.length === 0,
        fromVersion: currentDataVersion,
        toVersion: this.currentVersion,
        migratedKeys,
        errors
      }
    }) as MigrationResult
  }

  /**
   * Get data health report
   */
  getDataHealth(): {
    version: string
    totalKeys: number
    dataSize: number
    corruptedKeys: string[]
    missingCriticalKeys: string[]
    recommendations: string[]
  } {
    const currentData = this.getCurrentData()
    const corruptedKeys: string[] = []
    const missingCriticalKeys: string[] = []
    const recommendations: string[] = []
    
    // Check for corrupted data
    for (const [key, value] of Object.entries(currentData)) {
      if (typeof value === 'string') {
        try {
          JSON.parse(value)
        } catch {
          corruptedKeys.push(key)
        }
      }
    }
    
    // Check for critical keys
    const criticalKeys = ['flash-scan-result', 'full-audit-result']
    for (const key of criticalKeys) {
      if (!(key in currentData)) {
        missingCriticalKeys.push(key)
      }
    }
    
    // Generate recommendations
    if (corruptedKeys.length > 0) {
      recommendations.push('Some data appears corrupted. Consider creating a backup before proceeding.')
    }
    
    if (missingCriticalKeys.length > 0) {
      recommendations.push('Critical data is missing. You may need to re-run assessments.')
    }
    
    const dataSize = JSON.stringify(currentData).length
    if (dataSize > 1024 * 1024) { // 1MB
      recommendations.push('Data size is large. Consider cleaning up old data.')
    }
    
    return {
      version: this.detectDataVersion(currentData),
      totalKeys: Object.keys(currentData).length,
      dataSize,
      corruptedKeys,
      missingCriticalKeys,
      recommendations
    }
  }

  /**
   * Clean up old or unnecessary data
   */
  cleanupData(): { removedKeys: string[]; spaceSaved: number } {
    return performanceMonitor.trackSync('data-cleanup', () => {
      const removedKeys: string[] = []
      let spaceSaved = 0
      
      // Remove old performance metrics (keep only recent)
      const performanceKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('performance-') || key.startsWith('error-')
      )
      
      for (const key of performanceKeys) {
        const value = localStorage.getItem(key)
        if (value) {
          spaceSaved += value.length
          localStorage.removeItem(key)
          removedKeys.push(key)
        }
      }
      
      // Remove temporary data older than 7 days
      const tempKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('temp-') || key.startsWith('cache-')
      )
      
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      
      for (const key of tempKeys) {
        try {
          const value = localStorage.getItem(key)
          if (value) {
            const data = JSON.parse(value)
            if (data.timestamp && new Date(data.timestamp).getTime() < weekAgo) {
              spaceSaved += value.length
              localStorage.removeItem(key)
              removedKeys.push(key)
            }
          }
        } catch {
          // Remove corrupted temp data
          const value = localStorage.getItem(key)
          if (value) {
            spaceSaved += value.length
            localStorage.removeItem(key)
            removedKeys.push(key)
          }
        }
      }
      
      return { removedKeys, spaceSaved }
    }) as { removedKeys: string[]; spaceSaved: number }
  }

  private getCurrentData(): Record<string, any> {
    const data: Record<string, any> = {}
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value) {
          data[key] = value
        }
      }
    }
    
    return data
  }

  private saveData(data: Record<string, any>): void {
    localStorage.clear()
    
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    }
  }

  private detectDataVersion(data: Record<string, any>): string {
    // Simple version detection based on data structure
    if ('flash-scan-result' in data || 'full-audit-result' in data) {
      return '1.0'
    }
    
    return '1.0' // Default to current version
  }

  private calculateChecksum(data: Record<string, any>): string {
    // Simple checksum using string hash
    const str = JSON.stringify(data, Object.keys(data).sort())
    let hash = 0
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return hash.toString(36)
  }
}

// Global instance
export const dataMigration = new DataMigrationSystem()

// Convenience functions
export const createDataBackup = () => dataMigration.createBackup()
export const restoreDataBackup = (backup: DataBackup) => dataMigration.restoreFromBackup(backup)
export const getDataHealth = () => dataMigration.getDataHealth()
export const cleanupOldData = () => dataMigration.cleanupData()
