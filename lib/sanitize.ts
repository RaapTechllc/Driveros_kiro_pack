/**
 * Input sanitization utilities
 * Prevents XSS and ensures data integrity for user inputs
 */

import { MAX_INPUT_LENGTH, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from './constants'

/**
 * Sanitize generic text input
 * - Trims whitespace
 * - Removes HTML/script tags
 * - Enforces max length
 */
export function sanitizeInput(input: string, maxLength: number = MAX_INPUT_LENGTH): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove potential script injection patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Enforce max length
    .slice(0, maxLength)
}

/**
 * Sanitize title field
 */
export function sanitizeTitle(title: string): string {
  return sanitizeInput(title, MAX_TITLE_LENGTH)
}

/**
 * Sanitize description/why field
 */
export function sanitizeDescription(description: string): string {
  return sanitizeInput(description, MAX_DESCRIPTION_LENGTH)
}

/**
 * Sanitize numeric input - returns number or null
 */
export function sanitizeNumber(input: string | number, min?: number, max?: number): number | null {
  const num = typeof input === 'number' ? input : parseFloat(String(input).trim())

  if (isNaN(num)) {
    return null
  }

  if (min !== undefined && num < min) {
    return min
  }

  if (max !== undefined && num > max) {
    return max
  }

  return num
}

/**
 * Sanitize date string - returns ISO date or null
 */
export function sanitizeDate(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  const trimmed = input.trim()

  // Validate YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null
  }

  // Validate it's a real date
  const date = new Date(trimmed)
  if (isNaN(date.getTime())) {
    return null
  }

  return trimmed
}

/**
 * Sanitize enum value - returns value if valid, null otherwise
 */
export function sanitizeEnum<T extends string>(
  input: string,
  validValues: readonly T[]
): T | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  const trimmed = input.trim() as T
  return validValues.includes(trimmed) ? trimmed : null
}

/**
 * Sanitize object by applying sanitization to all string fields
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fieldConfig?: Partial<Record<keyof T, 'title' | 'description' | 'input'>>
): T {
  const result = { ...obj }

  for (const key in result) {
    const value = result[key]
    if (typeof value === 'string') {
      const config = fieldConfig?.[key]
      switch (config) {
        case 'title':
          result[key] = sanitizeTitle(value) as T[Extract<keyof T, string>]
          break
        case 'description':
          result[key] = sanitizeDescription(value) as T[Extract<keyof T, string>]
          break
        default:
          result[key] = sanitizeInput(value) as T[Extract<keyof T, string>]
      }
    }
  }

  return result
}

/**
 * Check if string contains potentially dangerous content
 */
export function containsDangerousContent(input: string): boolean {
  if (!input) return false

  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:/i,
    /vbscript:/i,
    /expression\s*\(/i
  ]

  return dangerousPatterns.some(pattern => pattern.test(input))
}
