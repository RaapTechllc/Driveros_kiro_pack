// Safe localStorage utilities with error handling and user feedback

export type StorageErrorType = 'QUOTA_EXCEEDED' | 'PARSE_ERROR' | 'UNAVAILABLE' | 'UNKNOWN'

export interface StorageError {
  type: StorageErrorType
  message: string
  key?: string
}

export type StorageErrorHandler = (error: StorageError) => void

// Default error handler - can be overridden by consuming code
let globalErrorHandler: StorageErrorHandler = (error) => {
  console.error(`[Storage] ${error.type}: ${error.message}`, error.key ? `(key: ${error.key})` : '')
}

export function setStorageErrorHandler(handler: StorageErrorHandler): void {
  globalErrorHandler = handler
}

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

// Classify error type
function classifyError(error: unknown): StorageErrorType {
  if (error instanceof Error) {
    if (error.name === 'QuotaExceededError' ||
      error.message.includes('quota') ||
      error.message.includes('storage')) {
      return 'QUOTA_EXCEEDED'
    }
    if (error instanceof SyntaxError) {
      return 'PARSE_ERROR'
    }
  }
  return 'UNKNOWN'
}

/**
 * Safely get and parse JSON from localStorage
 * Returns defaultValue on any error (parse errors, missing keys, etc.)
 */
export function safeGetItem<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) {
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item) as T
  } catch (error) {
    const errorType = classifyError(error)
    globalErrorHandler({
      type: errorType,
      message: errorType === 'PARSE_ERROR'
        ? 'Stored data is corrupted and could not be read'
        : 'Failed to read from storage',
      key
    })
    return defaultValue
  }
}

/**
 * Safely set JSON value to localStorage
 * Returns true on success, false on failure
 */
export function safeSetItem<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) {
    globalErrorHandler({
      type: 'UNAVAILABLE',
      message: 'localStorage is not available',
      key
    })
    return false
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    const errorType = classifyError(error)
    globalErrorHandler({
      type: errorType,
      message: errorType === 'QUOTA_EXCEEDED'
        ? 'Storage quota exceeded. Please export and clear old data.'
        : 'Failed to save to storage',
      key
    })
    return false
  }
}

/**
 * Safely remove item from localStorage
 */
export function safeRemoveItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false
  }

  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    globalErrorHandler({
      type: 'UNKNOWN',
      message: 'Failed to remove from storage',
      key
    })
    return false
  }
}

/**
 * Get estimated storage usage
 */
export function getStorageUsage(): { used: number; available: number; percentage: number } | null {
  if (!isLocalStorageAvailable()) {
    return null
  }

  try {
    let totalSize = 0
    for (const key of Object.keys(localStorage)) {
      const item = localStorage.getItem(key)
      if (item) {
        totalSize += key.length + item.length
      }
    }

    // localStorage typically has 5-10MB limit, assume 5MB
    const estimatedLimit = 5 * 1024 * 1024
    const usedBytes = totalSize * 2 // UTF-16 characters = 2 bytes each

    return {
      used: usedBytes,
      available: estimatedLimit - usedBytes,
      percentage: Math.round((usedBytes / estimatedLimit) * 100)
    }
  } catch {
    return null
  }
}

/**
 * Clear all app-related storage (preserves other site data)
 */
export function clearAppStorage(keyPrefixes: string[]): boolean {
  if (!isLocalStorageAvailable()) {
    return false
  }

  try {
    const keysToRemove: string[] = []
    for (const key of Object.keys(localStorage)) {
      if (keyPrefixes.some(prefix => key.startsWith(prefix))) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))
    return true
  } catch {
    return false
  }
}

// App-specific storage keys (centralized)
export const STORAGE_KEYS = {
  FLASH_SCAN_RESULT: 'flash-scan-result',
  FULL_AUDIT_RESULT: 'full-audit-result',
  IMPORTED_ACTIONS: 'imported-actions',
  IMPORTED_GOALS: 'imported-goals',
  ACTION_STATUSES: 'action-statuses',
  TEAM_ROSTER: 'team-roster',
  ENGINE_HISTORY: 'engine-history',
  YEAR_PLAN: 'year-plan',
  YEAR_ITEMS: 'year-items',
  APEX_AUDIT_RESULT: 'apex-audit-result',
  PARKED_IDEAS: 'parked-ideas',
  CHECK_INS: 'check-ins',
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]
