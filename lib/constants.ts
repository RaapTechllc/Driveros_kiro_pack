/**
 * Application-wide constants
 * Extracted from magic numbers to improve maintainability and document business rules
 */

// ============================================================================
// File Upload Limits
// ============================================================================

/** Maximum CSV file size in bytes (5MB) - prevents memory issues during parsing */
export const MAX_CSV_FILE_SIZE = 5 * 1024 * 1024

/** Maximum number of rows allowed in CSV import - prevents UI lag */
export const MAX_CSV_ROWS = 10000

/** File size threshold for "large file" warning (1MB) */
export const LARGE_FILE_WARNING_THRESHOLD = 1 * 1024 * 1024

/** File size threshold for "very large file" warning (5MB) */
export const VERY_LARGE_FILE_WARNING_THRESHOLD = 5 * 1024 * 1024

// ============================================================================
// Audit & Analysis Thresholds
// ============================================================================

/** Minimum completion score required before Full Audit analysis runs (70%) */
export const AUDIT_COMPLETION_GATE = 0.70

/** Engine score thresholds for status bands */
export const ENGINE_SCORE_THRESHOLDS = {
  /** Score >= 70 = green (healthy) */
  GREEN: 70,
  /** Score 40-69 = yellow (needs attention) */
  YELLOW: 40,
  /** Score < 40 = red (critical) */
  RED: 0
} as const

/** Gear estimation based on company size bands */
export const GEAR_SIZE_MAPPING = {
  '1-10': { baseGear: 2, reason: 'micro startup' },
  '11-50': { baseGear: 3, reason: 'small business' },
  '51-200': { baseGear: 4, reason: 'growth stage' },
  '201+': { baseGear: 5, reason: 'scale-up' }
} as const

// ============================================================================
// Flash Scan Confidence Scores
// ============================================================================

/** Base confidence score for Flash Scan results */
export const FLASH_SCAN_BASE_CONFIDENCE = 0.65

/** Maximum confidence score achievable in Flash Scan */
export const FLASH_SCAN_MAX_CONFIDENCE = 0.92

/** Confidence boost for each additional constraint identified */
export const FLASH_SCAN_CONSTRAINT_CONFIDENCE_BOOST = 0.05

// ============================================================================
// Year Board Limits
// ============================================================================

/** Minimum number of milestones per quarter */
export const MIN_MILESTONES_PER_QUARTER = 3

/** Maximum number of milestones per quarter */
export const MAX_MILESTONES_PER_QUARTER = 6

/** Maximum number of department goals allowed */
export const MAX_DEPARTMENT_GOALS = 3

// ============================================================================
// Performance Monitoring
// ============================================================================

/** Maximum number of performance metrics to retain in memory */
export const MAX_PERFORMANCE_METRICS = 100

/** Maximum number of error logs to retain in memory */
export const MAX_ERROR_LOGS = 50

/** Performance data cleanup interval in milliseconds (5 minutes) */
export const PERFORMANCE_CLEANUP_INTERVAL = 5 * 60 * 1000

/** Performance data retention period in milliseconds (1 hour) */
export const PERFORMANCE_RETENTION_PERIOD = 60 * 60 * 1000

// ============================================================================
// UI Animation Timings (ms)
// ============================================================================

/** Status transition animation duration */
export const STATUS_TRANSITION_DURATION = 200

/** Snapshot saved indicator display duration */
export const SNAPSHOT_SAVED_DURATION = 2000

/** Minimum form loading time for UX consistency */
export const MIN_FORM_LOADING_TIME = 1200

/** Success message display duration */
export const SUCCESS_DURATION = 800

// ============================================================================
// Validation Rules
// ============================================================================

/** Valid owner roles for actions */
export const VALID_OWNER_ROLES = ['Owner', 'Ops', 'Sales', 'Finance'] as const

/** Valid engine names */
export const VALID_ENGINES = ['Leadership', 'Operations', 'Marketing & Sales', 'Finance', 'Personnel'] as const

export type AppEngineName = typeof VALID_ENGINES[number]
export type AppOwnerRole = typeof VALID_OWNER_ROLES[number]

/** Valid action statuses */
export const VALID_STATUSES = ['todo', 'doing', 'done'] as const

export type AppActionStatus = typeof VALID_STATUSES[number]

/** Valid goal levels */
export const VALID_LEVELS = ['north_star', 'department'] as const

/** Valid department names */
export const VALID_DEPARTMENTS = ['Ops', 'Sales/Marketing', 'Finance'] as const

export type AppDepartment = typeof VALID_DEPARTMENTS[number]

/** Mapping between framework engine ids and app-facing engine labels */
export const FRAMEWORK_ENGINE_TO_APP_ENGINE = {
  vision: 'Leadership',
  people: 'Personnel',
  operations: 'Operations',
  revenue: 'Marketing & Sales',
  finance: 'Finance'
} as const

/** Mapping between app-facing engine labels and framework engine ids */
export const APP_ENGINE_TO_FRAMEWORK_ENGINE = {
  Leadership: 'vision',
  Personnel: 'people',
  Operations: 'operations',
  'Marketing & Sales': 'revenue',
  Finance: 'finance'
} as const

/** Minimum ETA days for actions */
export const MIN_ETA_DAYS = 1

/** Maximum ETA days for actions */
export const MAX_ETA_DAYS = 365

// ============================================================================
// Input Sanitization
// ============================================================================

/** Maximum length for user-provided text inputs */
export const MAX_INPUT_LENGTH = 1000

/** Maximum length for title fields */
export const MAX_TITLE_LENGTH = 200

/** Maximum length for description/why fields */
export const MAX_DESCRIPTION_LENGTH = 500

// ============================================================================
// localStorage Estimates
// ============================================================================

/** Estimated localStorage limit in bytes (5MB typical browser limit) */
export const ESTIMATED_STORAGE_LIMIT = 5 * 1024 * 1024

/** Storage warning threshold (80% of estimated limit) */
export const STORAGE_WARNING_THRESHOLD = 0.8
