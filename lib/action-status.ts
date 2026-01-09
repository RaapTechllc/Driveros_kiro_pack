// Action status persistence for dashboard actions

export type ActionStatus = 'todo' | 'doing' | 'done'

const STORAGE_KEY = 'action-statuses'

// Simple hash for action title to create stable key
function hashTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').slice(0, 50)
}

export function getActionStatuses(): Record<string, ActionStatus> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function getActionStatus(title: string): ActionStatus {
  const statuses = getActionStatuses()
  return statuses[hashTitle(title)] || 'todo'
}

export function setActionStatus(title: string, status: ActionStatus): void {
  if (typeof window === 'undefined') return
  const statuses = getActionStatuses()
  statuses[hashTitle(title)] = status
  localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
}

export function cycleStatus(current: ActionStatus): ActionStatus {
  const cycle: ActionStatus[] = ['todo', 'doing', 'done']
  const idx = cycle.indexOf(current)
  return cycle[(idx + 1) % 3]
}
