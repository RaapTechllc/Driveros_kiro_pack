'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { ActionStatus, cycleStatus, getActionStatus, setActionStatus } from '@/lib/action-status'
import { getTeamRoster, getAssignedMember, assignAction, addTeamMember, TeamMember } from '@/lib/team-roster'

interface ActionCardProps {
  title: string
  why: string
  owner_role: string
  eta_days: number
  engine: string
  source?: 'generated' | 'imported'
}

const statusStyles: Record<ActionStatus, { badge: string; text: string; cardBg: string }> = {
  todo: { 
    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-all duration-300', 
    text: 'transition-all duration-300', 
    cardBg: 'border-gray-200 dark:border-gray-700' 
  },
  doing: { 
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 transition-all duration-300 animate-racing-pulse', 
    text: 'transition-all duration-300', 
    cardBg: 'border-blue-200 dark:border-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
  },
  done: { 
    badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 transition-all duration-300', 
    text: 'line-through opacity-60 transition-all duration-300', 
    cardBg: 'border-green-200 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10' 
  }
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
    
    // Add a small delay to show the transition animation
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

  const style = statusStyles[status]

  return (
    <div className={`relative overflow-hidden border-2 rounded-2xl p-4 space-y-2 transition-all duration-300 hover:translate-x-1 hover:shadow-[0_0_20px_rgba(255,71,19,0.15)] ${style.cardBg} ${status === 'done' ? 'opacity-70' : ''} group`}>
      {/* Racing stripe accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Completion celebration effect */}
      {status === 'done' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-2 text-green-500 animate-slide-in">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      
      <div className="flex items-start justify-between gap-2">
        <div className={`font-medium flex-1 ${style.text}`}>{title}</div>
        <button
          onClick={handleStatusClick}
          className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:ring-2 hover:ring-offset-1 transform transition-all duration-200 hover:scale-105 active:scale-95 ${style.badge} ${isTransitioning ? 'animate-status-morph' : ''}`}
        >
          {status}
        </button>
        <Badge variant={source === 'imported' ? 'imported' : 'generated'}>{source === 'imported' ? 'Imported' : 'Generated'}</Badge>
      </div>
      <div className={`text-sm text-muted-foreground ${style.text}`}>{why}</div>
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{assignee?.name || owner_role}</Badge>
          <button
            onClick={() => setShowAssign(!showAssign)}
            className="text-xs text-blue-600 hover:underline"
          >
            {assignee ? 'reassign' : 'assign'}
          </button>
        </div>
        <div className="flex space-x-2 text-muted-foreground">
          <span>{eta_days}d</span>
          <span>•</span>
          <span>{engine}</span>
        </div>
      </div>
      {showAssign && (
        <div className="pt-2 border-t space-y-2">
          {roster.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {roster.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleAssign(m.id)}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-1">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="New team member"
              className="flex-1 px-2 py-1 text-xs border rounded"
              onKeyDown={e => e.key === 'Enter' && handleAddMember()}
            />
            <button
              onClick={handleAddMember}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
