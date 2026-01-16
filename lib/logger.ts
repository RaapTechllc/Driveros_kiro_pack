/**
 * Structured logging utility
 * Replaces raw console statements with structured, configurable logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  data?: Record<string, unknown>
  timestamp: string
  error?: Error
}

export type LogHandler = (entry: LogEntry) => void

// Configuration
let currentLogLevel: LogLevel = 'info'
let logHandlers: LogHandler[] = []

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

/**
 * Set the minimum log level
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level
}

/**
 * Add a custom log handler
 */
export function addLogHandler(handler: LogHandler): void {
  logHandlers.push(handler)
}

/**
 * Remove a log handler
 */
export function removeLogHandler(handler: LogHandler): void {
  logHandlers = logHandlers.filter(h => h !== handler)
}

/**
 * Clear all custom handlers
 */
export function clearLogHandlers(): void {
  logHandlers = []
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLogLevel]
}

function formatMessage(entry: LogEntry): string {
  const prefix = entry.context ? `[${entry.context}]` : ''
  return `${prefix} ${entry.message}`.trim()
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: Record<string, unknown>,
  error?: Error
): LogEntry {
  return {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
    error
  }
}

function processLog(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return

  // Default console output
  const formattedMessage = formatMessage(entry)

  switch (entry.level) {
    case 'debug':
      console.debug(formattedMessage, entry.data || '')
      break
    case 'info':
      console.info(formattedMessage, entry.data || '')
      break
    case 'warn':
      console.warn(formattedMessage, entry.data || '')
      break
    case 'error':
      if (entry.error) {
        console.error(formattedMessage, entry.error, entry.data || '')
      } else {
        console.error(formattedMessage, entry.data || '')
      }
      break
  }

  // Call custom handlers
  logHandlers.forEach(handler => {
    try {
      handler(entry)
    } catch (e) {
      console.error('Log handler error:', e)
    }
  })
}

/**
 * Create a logger instance with optional default context
 */
export function createLogger(defaultContext?: string) {
  return {
    debug(message: string, data?: Record<string, unknown>) {
      processLog(createLogEntry('debug', message, defaultContext, data))
    },

    info(message: string, data?: Record<string, unknown>) {
      processLog(createLogEntry('info', message, defaultContext, data))
    },

    warn(message: string, data?: Record<string, unknown>) {
      processLog(createLogEntry('warn', message, defaultContext, data))
    },

    error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
      const err = error instanceof Error ? error : undefined
      const errorData = error && !(error instanceof Error)
        ? { ...data, errorValue: error }
        : data
      processLog(createLogEntry('error', message, defaultContext, errorData, err))
    }
  }
}

// Default logger instance
export const logger = createLogger()

// Specialized loggers for different parts of the app
export const storageLogger = createLogger('Storage')
export const importLogger = createLogger('Import')
export const analysisLogger = createLogger('Analysis')
export const dashboardLogger = createLogger('Dashboard')
