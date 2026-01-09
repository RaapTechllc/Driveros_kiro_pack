// Goal progress persistence for dashboard

const STORAGE_KEY = 'goal-progress'

function hashTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').slice(0, 50)
}

export function getGoalProgress(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function getGoalCurrent(title: string): number | null {
  const progress = getGoalProgress()
  const value = progress[hashTitle(title)]
  return value !== undefined ? value : null
}

export function setGoalCurrent(title: string, current: number): void {
  if (typeof window === 'undefined') return
  const progress = getGoalProgress()
  progress[hashTitle(title)] = current
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}
