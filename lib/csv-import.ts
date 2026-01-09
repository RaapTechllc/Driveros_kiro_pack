/**
 * CSV Import Validation Engine
 * 
 * Validates and imports actions and goals from CSV files.
 * Supports chunked processing for large files with progress callbacks.
 * 
 * Validation rules (from .kiro/steering/import-export.md):
 * - Actions: title required, valid owner_role/engine/status enums
 * - Goals: level required, exactly one north_star, max 3 department goals
 * - Department goals must include alignment_statement
 * 
 * @see .kiro/steering/import-export.md for CSV format specifications
 */

import { trackCSVOperation } from './performance-monitor'

export interface CSVValidationError {
  row: number
  field: string
  message: string
  value?: string
}

export interface CSVImportResult {
  success: boolean
  data?: any[]
  errors: CSVValidationError[]
  totalRows: number
  validRows: number
}

export interface CSVProcessingOptions {
  chunkSize?: number
  onProgress?: (progress: number, currentRow: number, totalRows: number) => void
  onStageChange?: (stage: 'parsing' | 'validating' | 'importing' | 'complete' | 'error') => void
  signal?: AbortSignal
}

export interface ImportedAction {
  title: string
  why: string
  owner_role: 'Owner' | 'Ops' | 'Sales' | 'Finance'
  engine: 'Leadership' | 'Operations' | 'Marketing & Sales' | 'Finance' | 'Personnel'
  eta_days: number
  status: 'todo' | 'doing' | 'done'
  due_date?: string
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
const OPTIONAL_ACTION_HEADERS = ['due_date']
const ALL_ACTION_HEADERS = [...REQUIRED_ACTION_HEADERS, ...OPTIONAL_ACTION_HEADERS]

const REQUIRED_GOAL_HEADERS = ['level', 'title']
const OPTIONAL_GOAL_HEADERS = ['department', 'metric', 'current', 'target', 'due_date', 'alignment_statement']
const ALL_GOAL_HEADERS = [...REQUIRED_GOAL_HEADERS, ...OPTIONAL_GOAL_HEADERS]

const VALID_OWNER_ROLES = ['Owner', 'Ops', 'Sales', 'Finance']
const VALID_ENGINES = ['Leadership', 'Operations', 'Marketing & Sales', 'Finance', 'Personnel']
const VALID_STATUSES = ['todo', 'doing', 'done']
const VALID_LEVELS = ['north_star', 'department']
const VALID_DEPARTMENTS = ['Ops', 'Sales/Marketing', 'Finance']

export function parseCSV(csvContent: string): string[][] {
  return trackCSVOperation('csv-parse', () => {
    const lines = csvContent.trim().split('\n')
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
  }, csvContent.split('\n').length)
}

export function validateActionsCSV(csvContent: string, options: CSVProcessingOptions = {}): Promise<CSVImportResult> {
  return new Promise((resolve, reject) => {
    const { chunkSize = 100, onProgress, onStageChange, signal } = options
    
    try {
      onStageChange?.('parsing')
      
      const errors: CSVValidationError[] = []
      const rows = parseCSV(csvContent)
      
      if (rows.length === 0) {
        resolve({
          success: false,
          errors: [{ row: 0, field: 'file', message: 'CSV file is empty' }],
          totalRows: 0,
          validRows: 0
        })
        return
      }
      
      const headers = rows[0].map(h => h.toLowerCase().trim())
      const dataRows = rows.slice(1)
      
      // Validate headers
      for (const required of REQUIRED_ACTION_HEADERS) {
        if (!headers.includes(required.toLowerCase())) {
          errors.push({
            row: 0,
            field: required,
            message: `Missing required header: ${required}`
          })
        }
      }
      
      // Check for unknown headers
      for (const header of headers) {
        if (!ALL_ACTION_HEADERS.map(h => h.toLowerCase()).includes(header)) {
          errors.push({
            row: 0,
            field: header,
            message: `Unknown header: ${header}`
          })
        }
      }
      
      if (errors.length > 0) {
        resolve({
          success: false,
          errors,
          totalRows: dataRows.length,
          validRows: 0
        })
        return
      }
      
      onStageChange?.('validating')
      
      const validData: ImportedAction[] = []
      let processedRows = 0
      
      // Process rows in chunks to prevent UI blocking
      const processChunk = (startIndex: number) => {
        if (signal?.aborted) {
          reject(new Error('Import cancelled'))
          return
        }
        
        const endIndex = Math.min(startIndex + chunkSize, dataRows.length)
        
        for (let i = startIndex; i < endIndex; i++) {
          const row = dataRows[i]
          const rowNum = i + 2 // +2 because we skip header and arrays are 0-indexed
          const action: any = {}
          
          headers.forEach((header, colIndex) => {
            const value = row[colIndex]?.trim() || ''
            action[header] = value
          })
          
          // Validate required fields
          if (!action.title) {
            errors.push({ row: rowNum, field: 'title', message: 'Title is required', value: action.title })
          }
          
          if (!action.why) {
            errors.push({ row: rowNum, field: 'why', message: 'Why is required', value: action.why })
          }
          
          if (!VALID_OWNER_ROLES.includes(action.owner_role)) {
            errors.push({ 
              row: rowNum, 
              field: 'owner_role', 
              message: `Invalid owner_role. Must be one of: ${VALID_OWNER_ROLES.join(', ')}`,
              value: action.owner_role 
            })
          }
          
          if (!VALID_ENGINES.includes(action.engine)) {
            errors.push({ 
              row: rowNum, 
              field: 'engine', 
              message: `Invalid engine. Must be one of: ${VALID_ENGINES.join(', ')}`,
              value: action.engine 
            })
          }
          
          if (!VALID_STATUSES.includes(action.status)) {
            errors.push({ 
              row: rowNum, 
              field: 'status', 
              message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
              value: action.status 
            })
          }
          
          // Validate eta_days
          const etaDays = parseInt(action.eta_days)
          if (!action.eta_days || action.eta_days.trim() === '') {
            // Default to 7 if empty
            action.eta_days = 7
          } else if (isNaN(etaDays) || etaDays < 1 || etaDays > 365) {
            errors.push({ 
              row: rowNum, 
              field: 'eta_days', 
              message: 'eta_days must be a number between 1 and 365',
              value: action.eta_days 
            })
          } else {
            action.eta_days = etaDays
          }
          
          // Validate due_date if provided
          if (action.due_date && action.due_date !== '') {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/
            if (!dateRegex.test(action.due_date)) {
              errors.push({ 
                row: rowNum, 
                field: 'due_date', 
                message: 'due_date must be in YYYY-MM-DD format',
                value: action.due_date 
              })
            }
          }
          
          // If no errors for this row, add to valid data
          const rowErrors = errors.filter(e => e.row === rowNum)
          if (rowErrors.length === 0) {
            validData.push({
              title: action.title,
              why: action.why,
              owner_role: action.owner_role,
              engine: action.engine,
              eta_days: action.eta_days,
              status: action.status,
              due_date: action.due_date || undefined
            })
          }
          
          processedRows++
        }
        
        // Update progress
        const progress = (processedRows / dataRows.length) * 100
        onProgress?.(progress, processedRows, dataRows.length)
        
        // Continue with next chunk or finish
        if (endIndex < dataRows.length) {
          // Use setTimeout to yield control back to the browser
          setTimeout(() => processChunk(endIndex), 0)
        } else {
          // Processing complete
          onStageChange?.('complete')
          resolve({
            success: errors.length === 0,
            data: validData,
            errors: errors.slice(0, 5), // Return only first 5 errors
            totalRows: dataRows.length,
            validRows: validData.length
          })
        }
      }
      
      // Start processing
      processChunk(0)
      
    } catch (error) {
      onStageChange?.('error')
      reject(error)
    }
  })
}

export function validateGoalsCSV(csvContent: string, options: CSVProcessingOptions = {}): Promise<CSVImportResult> {
  return new Promise((resolve, reject) => {
    const { chunkSize = 100, onProgress, onStageChange, signal } = options
    
    try {
      onStageChange?.('parsing')
      
      const errors: CSVValidationError[] = []
      const rows = parseCSV(csvContent)
      
      if (rows.length === 0) {
        resolve({
          success: false,
          errors: [{ row: 0, field: 'file', message: 'CSV file is empty' }],
          totalRows: 0,
          validRows: 0
        })
        return
      }
      
      const headers = rows[0].map(h => h.toLowerCase().trim())
      const dataRows = rows.slice(1)
      
      // Validate headers
      for (const required of REQUIRED_GOAL_HEADERS) {
        if (!headers.includes(required.toLowerCase())) {
          errors.push({
            row: 0,
            field: required,
            message: `Missing required header: ${required}`
          })
        }
      }
      
      if (errors.length > 0) {
        resolve({
          success: false,
          errors,
          totalRows: dataRows.length,
          validRows: 0
        })
        return
      }
      
      onStageChange?.('validating')
      
      const validData: ImportedGoal[] = []
      let northStarCount = 0
      let departmentCount = 0
      let processedRows = 0
      
      // Process rows in chunks
      const processChunk = (startIndex: number) => {
        if (signal?.aborted) {
          reject(new Error('Import cancelled'))
          return
        }
        
        const endIndex = Math.min(startIndex + chunkSize, dataRows.length)
        
        for (let i = startIndex; i < endIndex; i++) {
          const row = dataRows[i]
          const rowNum = i + 2
          const goal: any = {}
          
          headers.forEach((header, colIndex) => {
            const value = row[colIndex]?.trim() || ''
            goal[header] = value
          })
          
          // Validate required fields
          if (!goal.title) {
            errors.push({ row: rowNum, field: 'title', message: 'Title is required', value: goal.title })
          }
          
          if (!VALID_LEVELS.includes(goal.level)) {
            errors.push({ 
              row: rowNum, 
              field: 'level', 
              message: `Invalid level. Must be one of: ${VALID_LEVELS.join(', ')}`,
              value: goal.level 
            })
          } else {
            if (goal.level === 'north_star') {
              northStarCount++
            } else {
              departmentCount++
            }
          }
          
          // Validate department goals
          if (goal.level === 'department') {
            if (!goal.alignment_statement) {
              errors.push({ 
                row: rowNum, 
                field: 'alignment_statement', 
                message: 'alignment_statement is required for department goals',
                value: goal.alignment_statement 
              })
            }
            
            if (goal.department && !VALID_DEPARTMENTS.includes(goal.department)) {
              errors.push({ 
                row: rowNum, 
                field: 'department', 
                message: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}`,
                value: goal.department 
              })
            }
          }
          
          // Validate numeric fields
          if (goal.current && goal.current !== '') {
            const current = parseFloat(goal.current)
            if (isNaN(current)) {
              errors.push({ 
                row: rowNum, 
                field: 'current', 
                message: 'current must be a number',
                value: goal.current 
              })
            } else {
              goal.current = current
            }
          }
          
          if (goal.target && goal.target !== '') {
            const target = parseFloat(goal.target)
            if (isNaN(target)) {
              errors.push({ 
                row: rowNum, 
                field: 'target', 
                message: 'target must be a number',
                value: goal.target 
              })
            } else {
              goal.target = target
            }
          }
          
          // Validate due_date if provided
          if (goal.due_date && goal.due_date !== '') {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/
            if (!dateRegex.test(goal.due_date)) {
              errors.push({ 
                row: rowNum, 
                field: 'due_date', 
                message: 'due_date must be in YYYY-MM-DD format',
                value: goal.due_date 
              })
            }
          }
          
          // If no errors for this row, add to valid data
          const rowErrors = errors.filter(e => e.row === rowNum)
          if (rowErrors.length === 0) {
            validData.push({
              level: goal.level,
              department: goal.department || undefined,
              title: goal.title,
              metric: goal.metric || undefined,
              current: goal.current || undefined,
              target: goal.target || undefined,
              due_date: goal.due_date || undefined,
              alignment_statement: goal.alignment_statement || undefined
            })
          }
          
          processedRows++
        }
        
        // Update progress
        const progress = (processedRows / dataRows.length) * 100
        onProgress?.(progress, processedRows, dataRows.length)
        
        // Continue with next chunk or finish
        if (endIndex < dataRows.length) {
          setTimeout(() => processChunk(endIndex), 0)
        } else {
          // Business rule validations
          if (northStarCount !== 1) {
            errors.push({ 
              row: 0, 
              field: 'level', 
              message: `Must have exactly 1 north_star goal, found ${northStarCount}` 
            })
          }
          
          if (departmentCount > 3) {
            errors.push({ 
              row: 0, 
              field: 'level', 
              message: `Maximum 3 department goals allowed, found ${departmentCount}` 
            })
          }
          
          onStageChange?.('complete')
          resolve({
            success: errors.length === 0,
            data: validData,
            errors: errors.slice(0, 5),
            totalRows: dataRows.length,
            validRows: validData.length
          })
        }
      }
      
      // Start processing
      processChunk(0)
      
    } catch (error) {
      onStageChange?.('error')
      reject(error)
    }
  })
}

// Backward-compatible synchronous versions for testing
export function validateActionsCSVSync(csvContent: string): CSVImportResult {
  const errors: CSVValidationError[] = []
  const rows = parseCSV(csvContent)
  
  if (rows.length === 0) {
    return {
      success: false,
      errors: [{ row: 0, field: 'file', message: 'CSV file is empty' }],
      totalRows: 0,
      validRows: 0
    }
  }
  
  const headers = rows[0].map(h => h.toLowerCase().trim())
  const dataRows = rows.slice(1)
  
  // Validate headers
  for (const required of REQUIRED_ACTION_HEADERS) {
    if (!headers.includes(required.toLowerCase())) {
      errors.push({
        row: 0,
        field: required,
        message: `Missing required header: ${required}`
      })
    }
  }
  
  // Check for unknown headers
  for (const header of headers) {
    if (!ALL_ACTION_HEADERS.map(h => h.toLowerCase()).includes(header)) {
      errors.push({
        row: 0,
        field: header,
        message: `Unknown header: ${header}`
      })
    }
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      errors,
      totalRows: dataRows.length,
      validRows: 0
    }
  }
  
  const validData: ImportedAction[] = []
  
  // Validate data rows (synchronous version)
  dataRows.forEach((row, index) => {
    const rowNum = index + 2
    const action: any = {}
    
    headers.forEach((header, colIndex) => {
      const value = row[colIndex]?.trim() || ''
      action[header] = value
    })
    
    // Validate required fields
    if (!action.title) {
      errors.push({ row: rowNum, field: 'title', message: 'Title is required', value: action.title })
    }
    
    if (!action.why) {
      errors.push({ row: rowNum, field: 'why', message: 'Why is required', value: action.why })
    }
    
    if (!VALID_OWNER_ROLES.includes(action.owner_role)) {
      errors.push({ 
        row: rowNum, 
        field: 'owner_role', 
        message: `Invalid owner_role. Must be one of: ${VALID_OWNER_ROLES.join(', ')}`,
        value: action.owner_role 
      })
    }
    
    if (!VALID_ENGINES.includes(action.engine)) {
      errors.push({ 
        row: rowNum, 
        field: 'engine', 
        message: `Invalid engine. Must be one of: ${VALID_ENGINES.join(', ')}`,
        value: action.engine 
      })
    }
    
    if (!VALID_STATUSES.includes(action.status)) {
      errors.push({ 
        row: rowNum, 
        field: 'status', 
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        value: action.status 
      })
    }
    
    // Validate eta_days
    const etaDays = parseInt(action.eta_days)
    if (!action.eta_days || action.eta_days.trim() === '') {
      action.eta_days = 7
    } else if (isNaN(etaDays) || etaDays < 1 || etaDays > 365) {
      errors.push({ 
        row: rowNum, 
        field: 'eta_days', 
        message: 'eta_days must be a number between 1 and 365',
        value: action.eta_days 
      })
    } else {
      action.eta_days = etaDays
    }
    
    // Validate due_date if provided
    if (action.due_date && action.due_date !== '') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(action.due_date)) {
        errors.push({ 
          row: rowNum, 
          field: 'due_date', 
          message: 'due_date must be in YYYY-MM-DD format',
          value: action.due_date 
        })
      }
    }
    
    // If no errors for this row, add to valid data
    const rowErrors = errors.filter(e => e.row === rowNum)
    if (rowErrors.length === 0) {
      validData.push({
        title: action.title,
        why: action.why,
        owner_role: action.owner_role,
        engine: action.engine,
        eta_days: action.eta_days,
        status: action.status,
        due_date: action.due_date || undefined
      })
    }
  })
  
  return {
    success: errors.length === 0,
    data: validData,
    errors: errors.slice(0, 5),
    totalRows: dataRows.length,
    validRows: validData.length
  }
}

export function validateGoalsCSVSync(csvContent: string): CSVImportResult {
  const errors: CSVValidationError[] = []
  const rows = parseCSV(csvContent)
  
  if (rows.length === 0) {
    return {
      success: false,
      errors: [{ row: 0, field: 'file', message: 'CSV file is empty' }],
      totalRows: 0,
      validRows: 0
    }
  }
  
  const headers = rows[0].map(h => h.toLowerCase().trim())
  const dataRows = rows.slice(1)
  
  // Validate headers
  for (const required of REQUIRED_GOAL_HEADERS) {
    if (!headers.includes(required.toLowerCase())) {
      errors.push({
        row: 0,
        field: required,
        message: `Missing required header: ${required}`
      })
    }
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      errors,
      totalRows: dataRows.length,
      validRows: 0
    }
  }
  
  const validData: ImportedGoal[] = []
  let northStarCount = 0
  let departmentCount = 0
  
  // Validate data rows (synchronous version)
  dataRows.forEach((row, index) => {
    const rowNum = index + 2
    const goal: any = {}
    
    headers.forEach((header, colIndex) => {
      const value = row[colIndex]?.trim() || ''
      goal[header] = value
    })
    
    // Validate required fields
    if (!goal.title) {
      errors.push({ row: rowNum, field: 'title', message: 'Title is required', value: goal.title })
    }
    
    if (!VALID_LEVELS.includes(goal.level)) {
      errors.push({ 
        row: rowNum, 
        field: 'level', 
        message: `Invalid level. Must be one of: ${VALID_LEVELS.join(', ')}`,
        value: goal.level 
      })
    } else {
      if (goal.level === 'north_star') {
        northStarCount++
      } else {
        departmentCount++
      }
    }
    
    // Validate department goals
    if (goal.level === 'department') {
      if (!goal.alignment_statement) {
        errors.push({ 
          row: rowNum, 
          field: 'alignment_statement', 
          message: 'alignment_statement is required for department goals',
          value: goal.alignment_statement 
        })
      }
      
      if (goal.department && !VALID_DEPARTMENTS.includes(goal.department)) {
        errors.push({ 
          row: rowNum, 
          field: 'department', 
          message: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}`,
          value: goal.department 
        })
      }
    }
    
    // Validate numeric fields
    if (goal.current && goal.current !== '') {
      const current = parseFloat(goal.current)
      if (isNaN(current)) {
        errors.push({ 
          row: rowNum, 
          field: 'current', 
          message: 'current must be a number',
          value: goal.current 
        })
      } else {
        goal.current = current
      }
    }
    
    if (goal.target && goal.target !== '') {
      const target = parseFloat(goal.target)
      if (isNaN(target)) {
        errors.push({ 
          row: rowNum, 
          field: 'target', 
          message: 'target must be a number',
          value: goal.target 
        })
      } else {
        goal.target = target
      }
    }
    
    // Validate due_date if provided
    if (goal.due_date && goal.due_date !== '') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(goal.due_date)) {
        errors.push({ 
          row: rowNum, 
          field: 'due_date', 
          message: 'due_date must be in YYYY-MM-DD format',
          value: goal.due_date 
        })
      }
    }
    
    // If no errors for this row, add to valid data
    const rowErrors = errors.filter(e => e.row === rowNum)
    if (rowErrors.length === 0) {
      validData.push({
        level: goal.level,
        department: goal.department || undefined,
        title: goal.title,
        metric: goal.metric || undefined,
        current: goal.current || undefined,
        target: goal.target || undefined,
        due_date: goal.due_date || undefined,
        alignment_statement: goal.alignment_statement || undefined
      })
    }
  })
  
  // Business rule validations
  if (northStarCount !== 1) {
    errors.push({ 
      row: 0, 
      field: 'level', 
      message: `Must have exactly 1 north_star goal, found ${northStarCount}` 
    })
  }
  
  if (departmentCount > 3) {
    errors.push({ 
      row: 0, 
      field: 'level', 
      message: `Maximum 3 department goals allowed, found ${departmentCount}` 
    })
  }
  
  return {
    success: errors.length === 0,
    data: validData,
    errors: errors.slice(0, 5),
    totalRows: dataRows.length,
    validRows: validData.length
  }
}

export function generateTemplateCSV(type: 'actions' | 'goals'): string {
  if (type === 'actions') {
    return [
      'title,why,owner_role,engine,eta_days,status,due_date',
      '"Set weekly team meeting","Improve communication and alignment",Owner,Leadership,7,todo,2026-01-15',
      '"Review Q4 financials","Understand cash flow trends",Finance,Finance,3,todo,',
      '"Update website copy","Improve conversion rates",Sales,"Marketing & Sales",5,doing,2026-01-20'
    ].join('\n')
  } else {
    return [
      'level,department,title,metric,current,target,due_date,alignment_statement',
      'north_star,,"Reach $2M ARR by end of year","Monthly Recurring Revenue",150000,166667,2026-12-31,',
      'department,Ops,"Reduce customer support response time","Average Response Time (hours)",8,2,2026-06-30,"Faster support improves retention and reduces churn"',
      'department,"Sales/Marketing","Increase qualified leads","Monthly Qualified Leads",50,100,2026-03-31,"More leads directly supports ARR growth target"'
    ].join('\n')
  }
}
