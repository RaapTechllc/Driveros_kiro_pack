/**
 * CSV Import Validation Engine
 * 
 * Validates and imports actions and goals from CSV files.
 * @see .kiro/steering/import-export.md for CSV format specifications
 */

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

const VALID_OWNER_ROLES = ['Owner', 'Ops', 'Sales', 'Finance']
const VALID_ENGINES = ['Leadership', 'Operations', 'Marketing & Sales', 'Finance', 'Personnel']
const VALID_STATUSES = ['todo', 'doing', 'done']
const VALID_LEVELS = ['north_star', 'department']
const VALID_DEPARTMENTS = ['Ops', 'Sales/Marketing', 'Finance']

const REQUIRED_ACTION_HEADERS = ['title', 'why', 'owner_role', 'engine', 'eta_days', 'status']
const REQUIRED_GOAL_HEADERS = ['level', 'title']

export function parseCSV(csvContent: string): string[][] {
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
}

export function validateActionsCSV(csvContent: string): Promise<CSVImportResult> {
  return Promise.resolve(validateActionsCSVSync(csvContent))
}

export function validateGoalsCSV(csvContent: string): Promise<CSVImportResult> {
  return Promise.resolve(validateGoalsCSVSync(csvContent))
}

export function validateActionsCSVSync(csvContent: string): CSVImportResult {
  const errors: CSVValidationError[] = []
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
  
  const validData: ImportedAction[] = []
  
  dataRows.forEach((row, index) => {
    const rowNum = index + 2
    const action: any = {}
    headers.forEach((header, colIndex) => {
      action[header] = row[colIndex]?.trim() || ''
    })
    
    // Validate fields
    if (!action.title) errors.push({ row: rowNum, field: 'title', message: 'Title is required' })
    if (!action.why) errors.push({ row: rowNum, field: 'why', message: 'Why is required' })
    if (!VALID_OWNER_ROLES.includes(action.owner_role)) {
      errors.push({ row: rowNum, field: 'owner_role', message: `Invalid owner_role. Must be one of: ${VALID_OWNER_ROLES.join(', ')}`, value: action.owner_role })
    }
    if (!VALID_ENGINES.includes(action.engine)) {
      errors.push({ row: rowNum, field: 'engine', message: `Invalid engine. Must be one of: ${VALID_ENGINES.join(', ')}`, value: action.engine })
    }
    if (!VALID_STATUSES.includes(action.status)) {
      errors.push({ row: rowNum, field: 'status', message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, value: action.status })
    }
    
    // Validate eta_days
    const etaDays = parseInt(action.eta_days)
    if (!action.eta_days || action.eta_days.trim() === '') {
      action.eta_days = 7
    } else if (isNaN(etaDays) || etaDays < 1 || etaDays > 365) {
      errors.push({ row: rowNum, field: 'eta_days', message: 'eta_days must be a number between 1 and 365', value: action.eta_days })
    } else {
      action.eta_days = etaDays
    }
    
    // Validate due_date format if provided
    if (action.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(action.due_date)) {
      errors.push({ row: rowNum, field: 'due_date', message: 'due_date must be in YYYY-MM-DD format', value: action.due_date })
    }
    
    if (!errors.some(e => e.row === rowNum)) {
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
  
  return { success: errors.length === 0, data: validData, errors: errors.slice(0, 5), totalRows: dataRows.length, validRows: validData.length }
}

export function validateGoalsCSVSync(csvContent: string): CSVImportResult {
  const errors: CSVValidationError[] = []
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
    const goal: any = {}
    headers.forEach((header, colIndex) => {
      goal[header] = row[colIndex]?.trim() || ''
    })
    
    if (!goal.title) errors.push({ row: rowNum, field: 'title', message: 'Title is required' })
    
    if (!VALID_LEVELS.includes(goal.level)) {
      errors.push({ row: rowNum, field: 'level', message: `Invalid level. Must be one of: ${VALID_LEVELS.join(', ')}`, value: goal.level })
    } else {
      goal.level === 'north_star' ? northStarCount++ : departmentCount++
    }
    
    if (goal.level === 'department') {
      if (!goal.alignment_statement) {
        errors.push({ row: rowNum, field: 'alignment_statement', message: 'alignment_statement is required for department goals' })
      }
      if (goal.department && !VALID_DEPARTMENTS.includes(goal.department)) {
        errors.push({ row: rowNum, field: 'department', message: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}`, value: goal.department })
      }
    }
    
    // Validate numeric fields
    if (goal.current && isNaN(parseFloat(goal.current))) {
      errors.push({ row: rowNum, field: 'current', message: 'current must be a number', value: goal.current })
    }
    if (goal.target && isNaN(parseFloat(goal.target))) {
      errors.push({ row: rowNum, field: 'target', message: 'target must be a number', value: goal.target })
    }
    if (goal.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(goal.due_date)) {
      errors.push({ row: rowNum, field: 'due_date', message: 'due_date must be in YYYY-MM-DD format', value: goal.due_date })
    }
    
    if (!errors.some(e => e.row === rowNum)) {
      validData.push({
        level: goal.level,
        department: goal.department || undefined,
        title: goal.title,
        metric: goal.metric || undefined,
        current: goal.current ? parseFloat(goal.current) : undefined,
        target: goal.target ? parseFloat(goal.target) : undefined,
        due_date: goal.due_date || undefined,
        alignment_statement: goal.alignment_statement || undefined
      })
    }
  })
  
  // Business rules
  if (northStarCount !== 1) {
    errors.push({ row: 0, field: 'level', message: `Must have exactly 1 north_star goal, found ${northStarCount}` })
  }
  if (departmentCount > 3) {
    errors.push({ row: 0, field: 'level', message: `Maximum 3 department goals allowed, found ${departmentCount}` })
  }
  
  return { success: errors.length === 0, data: validData, errors: errors.slice(0, 5), totalRows: dataRows.length, validRows: validData.length }
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
