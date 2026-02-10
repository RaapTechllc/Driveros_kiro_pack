import { YearPlan, YearItem } from './year-board-types'

// Storage utilities for Year Board data
export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function getStorageKey(key: string, year?: number): string {
  const currentYear = year || getCurrentYear()
  return `${key}-${currentYear}`
}

// Year Plan CRUD operations
export function saveYearPlan(plan: YearPlan): void {
  if (typeof window === 'undefined') return

  try {
    const key = getStorageKey('year-plan', plan.year)
    localStorage.setItem(key, JSON.stringify(plan))
  } catch (error) {
    console.error('Failed to save year plan:', error)
  }
}

export function loadYearPlan(year?: number): YearPlan | null {
  if (typeof window === 'undefined') return null

  try {
    const key = getStorageKey('year-plan', year)
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load year plan:', error)
    return null
  }
}

export function deleteYearPlan(year?: number): void {
  if (typeof window === 'undefined') return

  try {
    const key = getStorageKey('year-plan', year)
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to delete year plan:', error)
  }
}

// Year Items CRUD operations
export function saveYearItems(items: YearItem[], year?: number): void {
  if (typeof window === 'undefined') return

  try {
    const key = getStorageKey('year-items', year)
    localStorage.setItem(key, JSON.stringify(items))
  } catch (error) {
    console.error('Failed to save year items:', error)
  }
}

export function loadYearItems(year?: number): YearItem[] {
  if (typeof window === 'undefined') return []

  try {
    const key = getStorageKey('year-items', year)
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load year items:', error)
    return []
  }
}

export function addYearItem(item: YearItem, year?: number): void {
  const items = loadYearItems(year)
  items.push(item)
  saveYearItems(items, year)
}

export function updateYearItem(updatedItem: YearItem, year?: number): void {
  const items = loadYearItems(year)
  const index = items.findIndex(item => item.id === updatedItem.id)
  if (index !== -1) {
    items[index] = updatedItem
    saveYearItems(items, year)
  }
}

export function deleteYearItem(itemId: string, year?: number): void {
  const items = loadYearItems(year)
  const filteredItems = items.filter(item => item.id !== itemId)
  saveYearItems(filteredItems, year)
}

// Utility functions
export function createYearPlan(northStarGoalId?: string): YearPlan {
  const currentYear = getCurrentYear()
  return {
    id: `year-plan-${currentYear}-${Date.now()}`,
    tenant_id: 'default',
    company_id: 'default',
    year: currentYear,
    north_star_goal_id: northStarGoalId,
    created_by: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export function createYearItem(
  type: YearItem['type'],
  title: string,
  department: YearItem['department'],
  quarter: YearItem['quarter'],
  rationale: string,
  yearPlanId: string
): YearItem {
  return {
    id: `year-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    year_plan_id: yearPlanId,
    type,
    title,
    department,
    quarter,
    rationale,
    alignment_status: 'linked', // Default to linked for generated items
    created_by: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Move item between quarters/departments
export function moveYearItem(
  itemId: string,
  newQuarter: YearItem['quarter'],
  newDepartment: YearItem['department'],
  year?: number
): void {
  const items = loadYearItems(year)
  const item = items.find(item => item.id === itemId)

  if (item) {
    item.quarter = newQuarter
    item.department = newDepartment
    item.updated_at = new Date().toISOString()
    updateYearItem(item, year)
  }
}
