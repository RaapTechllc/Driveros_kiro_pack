import { isDemoMode } from './demo-mode'

export interface ImportedAction {
  id: string
  title: string
  why: string
  owner_role: 'Owner' | 'Ops' | 'Sales' | 'Finance'
  engine: string
  eta_days: number
  status: 'todo' | 'doing' | 'done'
  due_date?: string
  created_at: string
}

export interface ImportedGoal {
  id: string
  level: 'north_star' | 'department'
  department?: string
  title: string
  metric?: string
  current?: number
  target?: number
  due_date?: string
  alignment_statement?: string
  created_at: string
}

export function loadImportedActions(): ImportedAction[] {
  if (typeof window === 'undefined') return []
  
  try {
    const key = isDemoMode() ? 'demo-imported-actions' : 'imported-actions'
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load imported actions:', error)
    return []
  }
}

export function loadImportedGoals(): ImportedGoal[] {
  if (typeof window === 'undefined') return []
  
  try {
    const key = isDemoMode() ? 'demo-imported-goals' : 'imported-goals'
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load imported goals:', error)
    return []
  }
}

// Transform imported actions to match dashboard action interface
export function transformImportedActions(importedActions: ImportedAction[]) {
  return importedActions.map(action => ({
    ...action,
    source: 'imported' as const
  }))
}

// Transform imported goals to match dashboard goal interface  
export function transformImportedGoals(importedGoals: ImportedGoal[]) {
  return {
    northStar: importedGoals.find(g => g.level === 'north_star'),
    departments: importedGoals.filter(g => g.level === 'department')
  }
}
