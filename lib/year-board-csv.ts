import { YearItem, YearPlan } from './year-board-types'
import { loadYearPlan, loadYearItems, saveYearPlan, saveYearItems, createYearPlan, createYearItem } from './year-board-storage'

// CSV Export
export function exportYearBoard(year?: number): string {
  const plan = loadYearPlan(year)
  const items = loadYearItems(year)
  
  const headers = [
    'year',
    'type', 
    'title',
    'department',
    'quarter',
    'status',
    'rationale',
    'linked_goal_id',
    'start_date',
    'end_date'
  ]
  
  const rows = [headers.join(',')]
  
  items.forEach(item => {
    const row = [
      (plan?.year || new Date().getFullYear()).toString(),
      item.type,
      `"${item.title}"`,
      item.department,
      item.quarter.toString(),
      item.status || '',
      `"${item.rationale}"`,
      item.linked_goal_id || '',
      item.start_date || '',
      item.end_date || ''
    ]
    rows.push(row.join(','))
  })
  
  return rows.join('\n')
}

// CSV Import validation
interface CSVImportError {
  row: number
  field: string
  message: string
  value?: string
}

interface CSVImportResult {
  success: boolean
  items: YearItem[]
  errors: CSVImportError[]
  totalRows: number
  validRows: number
}

const VALID_TYPES = ['milestone', 'play', 'ritual', 'tuneup']
const VALID_DEPARTMENTS = ['company', 'ops', 'sales_marketing', 'finance']
const VALID_QUARTERS = [1, 2, 3, 4]
const VALID_STATUSES = ['planned', 'active', 'blocked', 'done', '']

export function validateYearBoardCSV(csvContent: string): CSVImportResult {
  const lines = csvContent.trim().split('\n')
  const errors: CSVImportError[] = []
  const items: YearItem[] = []
  
  if (lines.length < 2) {
    return {
      success: false,
      items: [],
      errors: [{ row: 0, field: 'file', message: 'CSV file is empty or has no data rows' }],
      totalRows: 0,
      validRows: 0
    }
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const requiredHeaders = ['year', 'type', 'title', 'department', 'quarter', 'rationale']
  
  // Validate headers
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
  if (missingHeaders.length > 0) {
    missingHeaders.forEach(header => {
      errors.push({
        row: 0,
        field: header,
        message: `Missing required header: ${header}`
      })
    })
  }
  
  // Validate data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i])
    const rowErrors: CSVImportError[] = []
    
    if (values.length < headers.length) {
      rowErrors.push({
        row: i + 1,
        field: 'row',
        message: 'Insufficient columns in row'
      })
      continue
    }
    
    const rowData: any = {}
    headers.forEach((header, index) => {
      rowData[header] = values[index] || ''
    })
    
    // Validate required fields
    if (!rowData.title?.trim()) {
      rowErrors.push({
        row: i + 1,
        field: 'title',
        message: 'Title is required'
      })
    }
    
    if (!rowData.rationale?.trim()) {
      rowErrors.push({
        row: i + 1,
        field: 'rationale',
        message: 'Rationale is required'
      })
    }
    
    // Validate enums
    if (!VALID_TYPES.includes(rowData.type)) {
      rowErrors.push({
        row: i + 1,
        field: 'type',
        message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`,
        value: rowData.type
      })
    }
    
    if (!VALID_DEPARTMENTS.includes(rowData.department)) {
      rowErrors.push({
        row: i + 1,
        field: 'department',
        message: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}`,
        value: rowData.department
      })
    }
    
    const quarter = parseInt(rowData.quarter)
    if (isNaN(quarter) || !VALID_QUARTERS.includes(quarter)) {
      rowErrors.push({
        row: i + 1,
        field: 'quarter',
        message: `Invalid quarter. Must be 1, 2, 3, or 4`,
        value: rowData.quarter
      })
    }
    
    if (rowData.status && !VALID_STATUSES.includes(rowData.status)) {
      rowErrors.push({
        row: i + 1,
        field: 'status',
        message: `Invalid status. Must be one of: ${VALID_STATUSES.filter(s => s).join(', ')} or empty`,
        value: rowData.status
      })
    }
    
    errors.push(...rowErrors)
    
    // Create item if no errors for this row
    if (rowErrors.length === 0) {
      const yearPlan = loadYearPlan(parseInt(rowData.year)) || createYearPlan()
      
      const item = createYearItem(
        rowData.type,
        rowData.title.trim(),
        rowData.department,
        quarter as YearItem['quarter'],
        rowData.rationale.trim(),
        yearPlan.id
      )
      
      // Set optional fields
      if (rowData.status) item.status = rowData.status
      if (rowData.linked_goal_id) {
        item.linked_goal_id = rowData.linked_goal_id
        item.alignment_status = 'linked'
      } else {
        item.alignment_status = 'unlinked'
      }
      if (rowData.start_date) item.start_date = rowData.start_date
      if (rowData.end_date) item.end_date = rowData.end_date
      
      items.push(item)
    }
  }
  
  return {
    success: errors.length === 0,
    items,
    errors: errors.slice(0, 10), // Limit to first 10 errors
    totalRows: lines.length - 1,
    validRows: items.length
  }
}

// Import CSV and save to storage
export function importYearBoardCSV(csvContent: string): CSVImportResult {
  const result = validateYearBoardCSV(csvContent)
  
  if (result.success && result.items.length > 0) {
    // Get or create year plan
    const year = new Date().getFullYear()
    let plan = loadYearPlan(year)
    
    if (!plan) {
      plan = createYearPlan()
      saveYearPlan(plan)
    }
    
    // Save imported items
    const existingItems = loadYearItems(year)
    const allItems = [...existingItems, ...result.items]
    saveYearItems(allItems, year)
  }
  
  return result
}

// Utility function to parse CSV row handling quoted values
function parseCSVRow(row: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  values.push(current.trim())
  return values
}

// Download helper
export function downloadYearBoardCSV(filename?: string): void {
  const csvContent = exportYearBoard()
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename || `YearBoard-${new Date().getFullYear()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
