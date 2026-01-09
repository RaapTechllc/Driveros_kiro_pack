'use client'

import { ActionStatus } from '@/lib/action-status'

export interface ActionFilters {
  engine: string
  owner: string
  status: string
}

interface ActionFiltersProps {
  filters: ActionFilters
  onChange: (filters: ActionFilters) => void
}

const ENGINES = ['All', 'Leadership', 'Operations', 'Marketing & Sales', 'Finance', 'Personnel']
const OWNERS = ['All', 'Owner', 'Ops', 'Sales', 'Finance']
const STATUSES = ['All', 'todo', 'doing', 'done']

export function ActionFiltersBar({ filters, onChange }: ActionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Engine:</label>
        <select
          value={filters.engine}
          onChange={(e) => onChange({ ...filters, engine: e.target.value })}
          className="text-sm border rounded px-2 py-1 bg-background"
        >
          {ENGINES.map(e => <option key={e} value={e === 'All' ? 'all' : e}>{e}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Owner:</label>
        <select
          value={filters.owner}
          onChange={(e) => onChange({ ...filters, owner: e.target.value })}
          className="text-sm border rounded px-2 py-1 bg-background"
        >
          {OWNERS.map(o => <option key={o} value={o === 'All' ? 'all' : o}>{o}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Status:</label>
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="text-sm border rounded px-2 py-1 bg-background"
        >
          {STATUSES.map(s => <option key={s} value={s === 'All' ? 'all' : s}>{s === 'All' ? s : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      {(filters.engine !== 'all' || filters.owner !== 'all' || filters.status !== 'all') && (
        <button
          type="button"
          onClick={() => onChange({ engine: 'all', owner: 'all', status: 'all' })}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

export function filterActions<T extends { engine: string; owner_role: string }>(
  actions: T[],
  filters: ActionFilters,
  getStatus?: (action: T) => ActionStatus
): T[] {
  return actions.filter(action => {
    if (filters.engine !== 'all' && action.engine !== filters.engine) return false
    if (filters.owner !== 'all' && action.owner_role !== filters.owner) return false
    if (filters.status !== 'all' && getStatus) {
      const status = getStatus(action)
      if (status !== filters.status) return false
    }
    return true
  })
}
