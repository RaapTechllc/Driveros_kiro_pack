/**
 * CSV Import Validation Engine
 * 
 * Validates and imports actions and goals from CSV files with security protections.
 * @see .kiro/steering/import-export.md for CSV format specifications
 */

import { z } from 'zod'
import { csvActionSchema, csvGoalSchema, type CSVActionInput, type CSVGoalInput } from './validation'
import { validateActionAlignment, type NorthStarInput } from './guardrails'
import { safeGetItem } from './storage'

export interface CSVValidationError {
  row: number
  field: string
  message: string
  value?: string
}

export interface CSVImportResult<T = ImportedAction | ImportedGoal> {
  success: boolean
  data?: T[]
  errors: CSVValidationError[]
  totalRows: number
  validRows: number
}

export interface ImportedAction {
  title: string
  why: string
  owner_role: 'Owner' | 'Ops' | 'Sales' | 'Finance'
  engine: 'Leadership' | 'Operations' | 'Marketing & Sales' | 'Finance' | 'Personnel'
  eta_days: number
  status: 'todo' | 'doing' | 'done'
  due_date?: string
  alignment_warning?: string // Added for guardrails
}

export interface ImportedGoal {
  level: 'north_star' | 'department'
  department?: 'Ops' | 'Sales/Marketing' | 'Finance'
  title: string
  metric?: string
  current?: number
  target?: number
  due_date?: string
  alignment_statement?: string
}

const REQUIRED_ACTION_HEADERS = ['title', 'why', 'owner_role', 'engine', 'eta_days', 'status']
const REQUIRED_GOAL_HEADERS = ['level', 'title']
const ACTION_OWNER_ROLES = ['Owner', 'Ops', 'Sales', 'Finance'] as const
const ACTION_ENGINES = ['Leadership', 'Operations', 'Marketing & Sales', 'Finance', 'Personnel'] as const
const GOAL_DEPARTMENTS = ['Ops', 'Sales/Marketing', 'Finance'] as const
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function parseCSV(csvContent: string): string[][] {
  // Validate input size to prevent DoS
  if (csvContent.length > 1024 * 1024) { // 1MB limit
    throw new Error('CSV file too large (max 1MB)')
  }

  const lines = csvContent.trim().split('\n')
  if (lines.length > 1000) { // Max 1000 rows
    throw new Error('CSV file has too many rows (max 1000)')
  }

  return lines.map(line => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  })
}

export function validateActionsCSV(csvContent: string): Promise<CSVImportResult> {
  return Promise.resolve(validateActionsCSVSync(csvContent))
}

export function validateGoalsCSV(csvContent: string): Promise<CSVImportResult> {
  return Promise.resolve(validateGoalsCSVSync(csvContent))
}

export function validateActionsCSVSync(csvContent: string): CSVImportResult {
  const errors: CSVValidationError[] = []
  
  try {
    const rows = parseCSV(csvContent)
    
    if (rows.length === 0) {
      return { success: false, errors: [{ row: 0, field: 'file', message: 'CSV file is empty' }], totalRows: 0, validRows: 0 }
    }
    
    const headers = rows[0].map(h => h.toLowerCase().trim())
    const dataRows = rows.slice(1)
    
    // Validate required headers
    for (const required of REQUIRED_ACTION_HEADERS) {
      if (!headers.includes(required.toLowerCase())) {
        errors.push({ row: 0, field: required, message: `Missing required header: ${required}` })
      }
    }
    
    if (errors.length > 0) {
      return { success: false, errors, totalRows: dataRows.length, validRows: 0 }
    }
    
    // Load North Star for guardrails validation
    const northStarResult = safeGetItem<NorthStarInput>('north-star')
    const northStar = northStarResult.success && northStarResult.data ? northStarResult.data : null
    
    const validData: ImportedAction[] = []
    
    dataRows.forEach((row, index) => {
      const rowNum = index + 2
      const action: Record<string, any> = {}
      const rowErrors: CSVValidationError[] = []
      
      headers.forEach((header, colIndex) => {
        const value = row[colIndex]?.trim() || ''
        
        // Convert string values to appropriate types
        if (header === 'eta_days') {
          if (!value) {
            action[header] = 7
          } else {
            const parsed = Number.parseInt(value, 10)
            action[header] = parsed
            if (Number.isNaN(parsed)) {
              rowErrors.push({
                row: rowNum,
                field: 'eta_days',
                message: 'eta_days must be a number',
                value,
              })
            }
          }
        } else if (header === 'due_date') {
          action[header] = value || undefined
        } else {
          action[header] = value
        }
      })

      if (action.owner_role && !ACTION_OWNER_ROLES.includes(action.owner_role)) {
        rowErrors.push({
          row: rowNum,
          field: 'owner_role',
          message: 'Invalid owner_role',
          value: action.owner_role,
        })
      }

      if (action.engine && !ACTION_ENGINES.includes(action.engine)) {
        rowErrors.push({
          row: rowNum,
          field: 'engine',
          message: 'Invalid engine',
          value: action.engine,
        })
      }

      if (action.due_date && !DATE_PATTERN.test(action.due_date)) {
        rowErrors.push({
          row: rowNum,
          field: 'due_date',
          message: 'due_date must be in YYYY-MM-DD format',
          value: action.due_date,
        })
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors)
        return
      }
      
      // Validate with Zod schema
      try {
        const validatedAction = csvActionSchema.parse(action) as ImportedAction
        
        // Apply guardrails validation
        if (northStar) {
          const alignment = validateActionAlignment(
            { title: validatedAction.title, why: validatedAction.why },
            northStar
          )
          if (!alignment.isValid) {
            validatedAction.alignment_warning = alignment.reason
          }
        }
        
        validData.push(validatedAction)
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.issues.forEach(err => {
            errors.push({
              row: rowNum,
              field: err.path[0] as string,
              message: err.message,
              value: action[err.path[0] as string]?.toString()
            })
          })
        }
      }
    })
    
    return { 
      success: errors.length === 0, 
      data: validData, 
      errors: errors.slice(0, 10), // Limit error display
      totalRows: dataRows.length, 
      validRows: validData.length 
    }
  } catch (error) {
    return { 
      success: false, 
      errors: [{ row: 0, field: 'file', message: error instanceof Error ? error.message : 'Failed to parse CSV' }], 
      totalRows: 0, 
      validRows: 0 
    }
  }
}

export function validateGoalsCSVSync(csvContent: string): CSVImportResult {
  const errors: CSVValidationError[] = []
  
  try {
    const rows = parseCSV(csvContent)
    
    if (rows.length === 0) {
      return { success: false, errors: [{ row: 0, field: 'file', message: 'CSV file is empty' }], totalRows: 0, validRows: 0 }
    }
    
    const headers = rows[0].map(h => h.toLowerCase().trim())
    const dataRows = rows.slice(1)
    
    for (const required of REQUIRED_GOAL_HEADERS) {
      if (!headers.includes(required.toLowerCase())) {
        errors.push({ row: 0, field: required, message: `Missing required header: ${required}` })
      }
    }
    
    if (errors.length > 0) {
      return { success: false, errors, totalRows: dataRows.length, validRows: 0 }
    }
    
    const validData: ImportedGoal[] = []
    let northStarCount = 0
    let departmentCount = 0
    
    dataRows.forEach((row, index) => {
      const rowNum = index + 2
      const goal: Record<string, any> = {}
      const rowErrors: CSVValidationError[] = []
      
      headers.forEach((header, colIndex) => {
        const value = row[colIndex]?.trim() || ''
        
        // Convert string values to appropriate types
        if (header === 'current' || header === 'target') {
          if (!value) {
            goal[header] = undefined
          } else {
            const parsed = Number.parseFloat(value)
            if (Number.isNaN(parsed)) {
              rowErrors.push({
                row: rowNum,
                field: header,
                message: `${header} must be a number`,
                value,
              })
              goal[header] = undefined
            } else {
              goal[header] = parsed
            }
          }
        } else {
          goal[header] = value || undefined
        }
      })

      if (goal.level === 'department' && !goal.alignment_statement) {
        rowErrors.push({
          row: rowNum,
          field: 'alignment_statement',
          message: 'alignment_statement is required for department goals',
          value: goal.alignment_statement,
        })
      }

      if (goal.department && !GOAL_DEPARTMENTS.includes(goal.department)) {
        rowErrors.push({
          row: rowNum,
          field: 'department',
          message: 'Invalid department',
          value: goal.department,
        })
      }

      if (goal.due_date && !DATE_PATTERN.test(goal.due_date)) {
        rowErrors.push({
          row: rowNum,
          field: 'due_date',
          message: 'due_date must be in YYYY-MM-DD format',
          value: goal.due_date,
        })
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors)
        return
      }
      
      // Validate with Zod schema
      try {
        const validatedGoal = csvGoalSchema.parse(goal) as ImportedGoal
        
        // Count goal types for business rules
        if (validatedGoal.level === 'north_star') {
          northStarCount++
        } else {
          departmentCount++
        }
        
        validData.push(validatedGoal)
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.issues.forEach(err => {
            errors.push({
              row: rowNum,
              field: err.path[0] as string,
              message: err.message,
              value: goal[err.path[0] as string]?.toString()
            })
          })
        }
      }
    })
    
    // Business rules validation
    if (northStarCount !== 1) {
      errors.push({ row: 0, field: 'level', message: `Must have exactly 1 north_star goal, found ${northStarCount}` })
    }
    if (departmentCount > 3) {
      errors.push({ row: 0, field: 'level', message: `Maximum 3 department goals allowed, found ${departmentCount}` })
    }
    
    return { 
      success: errors.length === 0, 
      data: validData, 
      errors: errors.slice(0, 10), // Limit error display
      totalRows: dataRows.length, 
      validRows: validData.length 
    }
  } catch (error) {
    return { 
      success: false, 
      errors: [{ row: 0, field: 'file', message: error instanceof Error ? error.message : 'Failed to parse CSV' }], 
      totalRows: 0, 
      validRows: 0 
    }
  }
}

export function generateTemplateCSV(type: 'actions' | 'goals'): string {
  if (type === 'actions') {
    return `title,why,owner_role,engine,eta_days,status,due_date
"Set weekly team meeting","Improve communication",Owner,Leadership,7,todo,"2026-01-15"
"Review Q4 financials","Understand cash flow",Finance,Finance,3,todo,
"Update website copy","Improve conversion",Sales,"Marketing & Sales",5,doing,"2026-01-20"`
  }
  return `level,department,title,metric,current,target,due_date,alignment_statement
north_star,,"Reach $2M ARR","MRR",150000,166667,"2026-12-31",
department,Ops,"Reduce support response time","Hours",8,2,"2026-06-30","Faster support improves retention"
department,"Sales/Marketing","Increase qualified leads","Monthly Leads",50,100,"2026-03-31","More leads supports ARR growth"`
}
