// Team roster and action assignment management

export interface TeamMember {
  id: string
  name: string
  role: 'Owner' | 'Ops' | 'Sales' | 'Finance'
}

const ROSTER_KEY = 'team-roster'
const ASSIGNMENTS_KEY = 'action-assignments'
const MAX_MEMBERS = 10

function hashTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').slice(0, 50)
}

export function getTeamRoster(): TeamMember[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(ROSTER_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addTeamMember(name: string, role: TeamMember['role']): TeamMember | null {
  if (typeof window === 'undefined') return null
  const roster = getTeamRoster()
  if (roster.length >= MAX_MEMBERS) return null
  
  const member: TeamMember = {
    id: Date.now().toString(),
    name: name.trim(),
    role
  }
  roster.push(member)
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster))
  return member
}

export function removeTeamMember(id: string): void {
  if (typeof window === 'undefined') return
  const roster = getTeamRoster().filter(m => m.id !== id)
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster))
}

export function getActionAssignments(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(ASSIGNMENTS_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function assignAction(actionTitle: string, memberId: string): void {
  if (typeof window === 'undefined') return
  const assignments = getActionAssignments()
  assignments[hashTitle(actionTitle)] = memberId
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments))
}

export function getAssignedMember(actionTitle: string): TeamMember | null {
  const assignments = getActionAssignments()
  const memberId = assignments[hashTitle(actionTitle)]
  if (!memberId) return null
  return getTeamRoster().find(m => m.id === memberId) || null
}
