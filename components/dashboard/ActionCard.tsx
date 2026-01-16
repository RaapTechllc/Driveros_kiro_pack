import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { ActionStatus, cycleStatus, getActionStatus, setActionStatus } from '@/lib/action-status'
import { getTeamRoster, getAssignedMember, assignAction, addTeamMember, TeamMember } from '@/lib/team-roster'
import { Clock, User, Zap, CheckCircle2, RotateCw, Plus, LucideIcon } from 'lucide-react'

interface ActionCardProps {
  title: string
  why: string
  owner_role: string
  eta_days: number
  engine: string
  source?: 'generated' | 'imported'
}

interface StatusConfigItem {
  color: string
  icon: LucideIcon
  label: string
}

const statusConfig: Record<ActionStatus, StatusConfigItem> = {
  todo: { color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', icon: Clock, label: 'To Do' },
  doing: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]', icon: RotateCw, label: 'In Progress' },
  done: { color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: CheckCircle2, label: 'Complete' }
}

export function ActionCard({ title, why, owner_role, eta_days, engine, source = 'generated' }: ActionCardProps) {
  const [status, setStatus] = useState<ActionStatus>(() => getActionStatus(title))
  const [assignee, setAssignee] = useState<TeamMember | null>(null)
  const [showAssign, setShowAssign] = useState(false)
  const [roster, setRoster] = useState<TeamMember[]>([])
  const [newName, setNewName] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setAssignee(getAssignedMember(title))
    setRoster(getTeamRoster())
  }, [title])

  const handleStatusClick = () => {
    setIsTransitioning(true)
    const next = cycleStatus(status)

    setTimeout(() => {
      setStatus(next)
      setActionStatus(title, next)
      setIsTransitioning(false)
    }, 200)
  }

  const handleAssign = (memberId: string) => {
    assignAction(title, memberId)
    setAssignee(roster.find(m => m.id === memberId) || null)
    setShowAssign(false)
  }

  const handleAddMember = () => {
    if (!newName.trim()) return
    const member = addTeamMember(newName, owner_role as TeamMember['role'])
    if (member) {
      setRoster([...roster, member])
      handleAssign(member.id)
    }
    setNewName('')
  }

  const currentConfig = statusConfig[status]
  const StatusIcon = currentConfig.icon

  return (
    <div className={`
      relative overflow-hidden rounded-xl border transition-all duration-300 group
      ${status === 'done' ? 'opacity-60 border-green-900/30 bg-green-950/5' : 'border-white/10 bg-[#0c0c0c] hover:border-white/20 hover:bg-[#111]'}
    `}>
      {/* Active State Glow */}
      {status === 'doing' && (
        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none animate-pulse" />
      )}

      {/* Technical Header Strip */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-primary/70" />
          <span>{source}</span>
        </div>
        <span>{engine}</span>
      </div>

      <div className="p-4 space-y-4 relative z-10">
        <div className="flex justify-between items-start gap-4">
          {/* Title & Description */}
          <div className="space-y-1 flex-1">
            <h4 className={`font-semibold text-sm leading-tight ${status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {why}
            </p>
          </div>

          {/* Status Button */}
          <button
            onClick={handleStatusClick}
            className={`
               flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[10px] font-bold uppercase tracking-wide transition-all hover:scale-105 active:scale-95
               ${currentConfig.color}
               ${isTransitioning ? 'opacity-50 scale-95' : ''}
             `}
          >
            <StatusIcon className={`w-3 h-3 ${status === 'doing' ? 'animate-spin-slow' : ''}`} />
            {status === 'doing' ? 'Doing' : currentConfig.label}
          </button>
        </div>

        {/* Footer Metadata */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          {/* Assignee Section */}
          <div className="relative">
            <button
              onClick={() => setShowAssign(!showAssign)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors group/assign"
            >
              <div className="p-1 rounded bg-white/5 group-hover/assign:bg-primary/20 transition-colors">
                <User className="w-3 h-3" />
              </div>
              <span>{assignee?.name || owner_role}</span>
            </button>

            {/* Assignee Dropdown */}
            {showAssign && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 p-2 space-y-2 animate-in fade-in slide-in-from-top-1">
                <div className="text-[10px] font-bold text-muted-foreground px-2 uppercase">Assign To</div>
                <div className="space-y-0.5 max-h-32 overflow-y-auto">
                  {roster.map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleAssign(m.id)}
                      className="w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-white/10 rounded"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 pt-2 border-t border-white/10">
                  <input
                    className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                    placeholder="New name..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                  />
                  <button
                    onClick={handleAddMember}
                    className="p-1 bg-primary/20 hover:bg-primary/40 text-primary rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ETA Section */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{eta_days}d</span>
          </div>
        </div>
      </div>
    </div>
  )
}
