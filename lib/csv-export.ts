import { FullAuditResult } from './full-audit-analysis'
import { FlashScanResult } from './types'
import { loadImportedActions, loadImportedGoals } from './imported-data'

/**
 * Escapes a value for safe CSV export according to RFC 4180
 * - Doubles internal quotes ("" instead of ")
 * - Wraps in quotes if contains special chars
 * - Prevents formula injection by prefixing with single quote
 *
 * @param value - String value to escape
 * @returns Safely escaped CSV value
 */
function escapeCSVValue(value: string): string {
  if (!value) return '""'

  // Prevent formula injection (Excel, Google Sheets, LibreOffice)
  // If starts with =, +, -, @, treat as potential formula
  const startsWithFormulaChar = /^[=+\-@\t\r]/.test(value)

  // Escape internal quotes by doubling them (CSV RFC 4180 standard)
  let escaped = value.replace(/"/g, '""')

  // Prefix formulas with single quote to render as text
  if (startsWithFormulaChar) {
    escaped = `'${escaped}`
  }

  // Always wrap in quotes for consistency and safety
  return `"${escaped}"`
}

// Enhanced CSV export with multiple formats
export function exportActions(auditResult?: FullAuditResult, flashResult?: FlashScanResult): string {
  const headers = ['title', 'why', 'owner_role', 'engine', 'eta_days', 'status', 'due_date', 'source']
  const rows = [headers.join(',')]

  // Add generated actions
  if (auditResult) {
    auditResult.actions.do_now.forEach(action => {
      const row = [
        escapeCSVValue(action.title),
        escapeCSVValue(action.why),
        escapeCSVValue(action.owner_role),
        escapeCSVValue(action.engine),
        action.eta_days.toString(),
        escapeCSVValue('todo'),
        escapeCSVValue(''),
        escapeCSVValue('generated')
      ]
      rows.push(row.join(','))
    })

    auditResult.actions.do_next.forEach(action => {
      const row = [
        escapeCSVValue(action.title),
        escapeCSVValue(action.why),
        escapeCSVValue(action.owner_role),
        escapeCSVValue(action.engine),
        action.eta_days.toString(),
        escapeCSVValue('todo'),
        escapeCSVValue(''),
        escapeCSVValue('generated')
      ]
      rows.push(row.join(','))
    })
  }

  if (flashResult) {
    flashResult.quick_wins.forEach(win => {
      const row = [
        escapeCSVValue(win.title),
        escapeCSVValue(win.why),
        escapeCSVValue(win.owner_role),
        escapeCSVValue(win.engine),
        win.eta_days.toString(),
        escapeCSVValue('todo'),
        escapeCSVValue(''),
        escapeCSVValue('generated')
      ]
      rows.push(row.join(','))
    })
  }

  // Add imported actions
  const importedActions = loadImportedActions()
  importedActions.forEach(action => {
    const row = [
      escapeCSVValue(action.title),
      escapeCSVValue(action.why),
      escapeCSVValue(action.owner_role),
      escapeCSVValue(action.engine),
      action.eta_days.toString(),
      escapeCSVValue(action.status),
      escapeCSVValue(action.due_date || ''),
      escapeCSVValue('imported')
    ]
    rows.push(row.join(','))
  })

  return rows.join('\n')
}

export function exportGoals(auditResult?: FullAuditResult): string {
  const headers = ['level', 'department', 'title', 'metric', 'current', 'target', 'due_date', 'alignment_statement', 'source']
  const rows = [headers.join(',')]

  // Add generated goals
  if (auditResult) {
    // North Star
    const northStar = auditResult.goals.north_star
    if (northStar.title) {
      const row = [
        escapeCSVValue('north_star'),
        escapeCSVValue(''),
        escapeCSVValue(northStar.title),
        escapeCSVValue(northStar.metric || ''),
        northStar.current?.toString() || '',
        northStar.target?.toString() || '',
        escapeCSVValue(northStar.due_date || ''),
        escapeCSVValue(''),
        escapeCSVValue('generated')
      ]
      rows.push(row.join(','))
    }

    // Department goals
    auditResult.goals.departments.forEach(goal => {
      const row = [
        escapeCSVValue('department'),
        escapeCSVValue(goal.department),
        escapeCSVValue(goal.title),
        escapeCSVValue(goal.metric || ''),
        goal.current?.toString() || '',
        goal.target?.toString() || '',
        escapeCSVValue(goal.due_date || ''),
        escapeCSVValue(goal.alignment_statement),
        escapeCSVValue('generated')
      ]
      rows.push(row.join(','))
    })
  }

  // Add imported goals
  const importedGoals = loadImportedGoals()
  importedGoals.forEach(goal => {
    const row = [
      escapeCSVValue(goal.level),
      escapeCSVValue(goal.department || ''),
      escapeCSVValue(goal.title),
      escapeCSVValue(goal.metric || ''),
      goal.current?.toString() || '',
      goal.target?.toString() || '',
      escapeCSVValue(goal.due_date || ''),
      escapeCSVValue(goal.alignment_statement || ''),
      escapeCSVValue('imported')
    ]
    rows.push(row.join(','))
  })

  return rows.join('\n')
}

export function exportMeetingTemplates(): string {
  const headers = ['type', 'title', 'duration_min', 'agenda_item', 'description']
  const rows = [headers.join(',')]

  const meetings = [
    {
      type: 'warm_up',
      title: 'Daily Warm-Up',
      duration_min: 10,
      agenda: [
        'Review yesterday\'s Accelerator result',
        'Identify today\'s top blocker',
        'Set one action with owner and ETA'
      ]
    },
    {
      type: 'pit_stop',
      title: 'Weekly Pit Stop',
      duration_min: 30,
      agenda: [
        'Accelerator: win or miss? Why?',
        'Top 1 engine gap (pick the lowest engine)',
        'Set 3 actions with owners and due dates'
      ]
    },
    {
      type: 'full_tune_up',
      title: 'Monthly Full Tune-Up',
      duration_min: 75,
      agenda: [
        'North Star still right?',
        'Accelerator still the right lever?',
        'Re-align department goals',
        'Reset the next 4 weeks'
      ]
    }
  ]

  meetings.forEach(meeting => {
    meeting.agenda.forEach(item => {
      const row = [
        escapeCSVValue(meeting.type),
        escapeCSVValue(meeting.title),
        meeting.duration_min.toString(),
        escapeCSVValue(item),
        escapeCSVValue(`${meeting.type} meeting agenda item`)
      ]
      rows.push(row.join(','))
    })
  })

  return rows.join('\n')
}

export function exportCombinedData(auditResult?: FullAuditResult, flashResult?: FlashScanResult): string {
  const timestamp = new Date().toISOString()
  const company = auditResult?.company || { industry: 'Unknown', role: 'Unknown', size_band: 'Unknown' }
  
  let content = `# DriverOS Complete Export\n`
  content += `# Generated: ${timestamp}\n`
  content += `# Company: ${company.industry} | ${company.size_band} | ${company.role}\n`
  content += `# Schema Version: 1.0\n\n`

  // Goals section
  content += `# GOALS\n`
  content += exportGoals(auditResult) + '\n\n'

  // Actions section  
  content += `# ACTIONS\n`
  content += exportActions(auditResult, flashResult) + '\n\n'

  // Meetings section
  content += `# MEETING TEMPLATES\n`
  content += exportMeetingTemplates() + '\n'

  return content
}

export function exportExcelReady(auditResult?: FullAuditResult, flashResult?: FlashScanResult): string {
  const timestamp = new Date().toISOString()
  
  let content = `DriverOS Export - Excel Ready Format\n`
  content += `Generated: ${timestamp}\n`
  content += `Instructions: Each section below can be copied to separate Excel sheets\n\n`

  // Actions with examples
  content += `ACTIONS SHEET\n`
  content += `title,why,owner_role,engine,eta_days,status,due_date,source\n`
  content += `"Example: Weekly team standup","Improves communication and alignment",Owner,Leadership,7,todo,2026-01-15,example\n`
  content += exportActions(auditResult, flashResult).split('\n').slice(1).join('\n') + '\n\n'

  // Goals with examples
  content += `GOALS SHEET\n`
  content += `level,department,title,metric,current,target,due_date,alignment_statement,source\n`
  content += `"north_star","","Example: Reach $2M ARR","Annual Revenue",800000,2000000,2026-12-31,"",example\n`
  content += exportGoals(auditResult).split('\n').slice(1).join('\n') + '\n\n'

  // Field descriptions
  content += `FIELD DESCRIPTIONS\n`
  content += `Actions:\n`
  content += `- title: Brief description of the action (required)\n`
  content += `- why: One sentence explanation of importance (required)\n`
  content += `- owner_role: Owner, Ops, Sales, or Finance (required)\n`
  content += `- engine: Leadership, Operations, Marketing & Sales, Finance, or Personnel (required)\n`
  content += `- eta_days: Number of days to complete, 1-365 (required)\n`
  content += `- status: todo, doing, or done (required)\n`
  content += `- due_date: YYYY-MM-DD format (optional)\n`
  content += `- source: generated or imported (auto-filled)\n\n`

  content += `Goals:\n`
  content += `- level: north_star or department (required)\n`
  content += `- department: Ops, Sales/Marketing, or Finance for department goals (optional)\n`
  content += `- title: Goal description (required)\n`
  content += `- metric: How success is measured (optional)\n`
  content += `- current: Current value as number (optional)\n`
  content += `- target: Target value as number (optional)\n`
  content += `- due_date: YYYY-MM-DD format (optional)\n`
  content += `- alignment_statement: How this supports North Star, required for department goals (optional)\n`
  content += `- source: generated or imported (auto-filled)\n`

  return content
}

// Download helper function
export function downloadCSV(content: string, filename: string): void {
  try {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up object URL to prevent memory leaks
    setTimeout(() => URL.revokeObjectURL(url), 100)
  } catch (error) {
    console.error('Failed to download CSV:', error)
    // Could also show user-facing error toast here
    throw new Error('Failed to download CSV file. Please try again.')
  }
}
