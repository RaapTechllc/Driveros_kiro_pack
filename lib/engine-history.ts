// Engine score history for trend tracking

export interface EngineSnapshot {
  timestamp: string
  scores: Record<string, number>
}

const STORAGE_KEY = 'engine-history'
const MAX_ENTRIES = 12

export function getEngineHistory(): EngineSnapshot[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveEngineSnapshot(scores: Record<string, number>): void {
  if (typeof window === 'undefined') return
  const history = getEngineHistory()
  history.push({ timestamp: new Date().toISOString(), scores })
  // Keep only last MAX_ENTRIES
  while (history.length > MAX_ENTRIES) history.shift()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export type TrendDirection = 'up' | 'down' | 'stable' | 'new'

export function calcTrend(engineName: string, history: EngineSnapshot[]): TrendDirection {
  if (history.length < 2) return 'new'
  
  const latest = history[history.length - 1].scores[engineName]
  // Compare to 4 entries ago, or earliest if less
  const compareIdx = Math.max(0, history.length - 5)
  const previous = history[compareIdx].scores[engineName]
  
  if (latest === undefined || previous === undefined) return 'new'
  
  const diff = latest - previous
  if (diff >= 5) return 'up'
  if (diff <= -5) return 'down'
  return 'stable'
}

export function getTrendArrow(trend: TrendDirection): string {
  switch (trend) {
    case 'up': return '↑'
    case 'down': return '↓'
    case 'stable': return '→'
    case 'new': return '●'
  }
}
