import { ActionStatus } from '@/lib/action-status'
import { Filter, Users, Layers, XCircle } from 'lucide-react'

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
  const hasActiveFilters = filters.engine !== 'all' || filters.owner !== 'all' || filters.status !== 'all'

  const FilterSelect = ({
    icon: Icon,
    value,
    options,
    onChange: handleChange
  }: {
    icon: any,
    value: string,
    options: string[],
    onChange: (val: string) => void
  }) => (
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none">
        <Icon className="w-4 h-4" />
      </div>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="
          appearance-none pl-9 pr-8 py-2 text-sm bg-background border border-border/50 rounded-lg 
          focus:ring-1 focus:ring-primary focus:border-primary hover:border-border transition-all
          cursor-pointer text-foreground font-medium
        "
      >
        {options.map(opt => (
          <option key={opt} value={opt === 'All' ? 'all' : opt}>
            {opt === 'All' ? `All ${opt === ENGINES[0] ? 'Engines' : opt === OWNERS[0] ? 'Owners' : 'Statuses'}` : opt}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  )

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
        <FilterSelect
          icon={Layers}
          value={filters.engine}
          options={ENGINES}
          onChange={(v) => onChange({ ...filters, engine: v })}
        />
        <FilterSelect
          icon={Users}
          value={filters.owner}
          options={OWNERS}
          onChange={(v) => onChange({ ...filters, owner: v })}
        />
        <FilterSelect
          icon={Filter}
          value={filters.status}
          options={STATUSES}
          onChange={(v) => onChange({ ...filters, status: v })}
        />
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange({ engine: 'all', owner: 'all', status: 'all' })}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors px-2 py-1"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Clear</span>
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
