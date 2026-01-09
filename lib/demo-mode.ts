// Demo mode utilities and state management
export function enableDemoMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demo-mode', 'true')
    localStorage.setItem('demo-timestamp', new Date().toISOString())
  }
}

export function exitDemoMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demo-mode')
    localStorage.removeItem('demo-timestamp')
    // Clear any demo-specific data
    localStorage.removeItem('demo-flash-result')
    localStorage.removeItem('demo-full-audit-result')
    localStorage.removeItem('demo-imported-actions')
    localStorage.removeItem('demo-imported-goals')
  }
}

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('demo-mode') === 'true'
}

export function getDemoTimestamp(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('demo-timestamp')
}

// Load demo data into localStorage for dashboard consumption
export function loadDemoData(): void {
  if (typeof window === 'undefined') return

  // Import demo data from existing demo-data.ts
  const { DEMO_FULL_AUDIT_RESULT } = require('./demo-data')
  
  // Store demo copy for reference
  localStorage.setItem('demo-full-audit-result', JSON.stringify(DEMO_FULL_AUDIT_RESULT))
  
  // Set main key for dashboard (dashboard prioritizes audit over flash)
  // Only setting audit result since demo showcases full feature set
  localStorage.setItem('full-audit-result', JSON.stringify(DEMO_FULL_AUDIT_RESULT))
  
  // Add demo imported actions
  const demoActions = [
    {
      id: 'demo-1',
      title: 'Weekly team standup meetings',
      why: 'Improves communication and alignment',
      owner_role: 'Owner',
      engine: 'Leadership',
      eta_days: 7,
      status: 'todo',
      due_date: '2026-01-15',
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-2', 
      title: 'Implement customer feedback system',
      why: 'Captures user insights for product improvement',
      owner_role: 'Ops',
      engine: 'Operations',
      eta_days: 14,
      status: 'doing',
      due_date: '2026-01-22',
      created_at: new Date().toISOString()
    }
  ]
  
  // Add demo imported goals
  const demoGoals = [
    {
      id: 'demo-goal-1',
      level: 'north_star',
      department: '',
      title: 'Reach $2M ARR by Dec 2026 with 25% net margin',
      metric: 'Annual Recurring Revenue',
      current: 800000,
      target: 2000000,
      due_date: '2026-12-31',
      alignment_statement: '',
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-goal-2',
      level: 'department',
      department: 'Ops',
      title: 'Reduce customer support response time to under 2 hours',
      metric: 'Average Response Time (hours)',
      current: 8,
      target: 2,
      due_date: '2026-06-30',
      alignment_statement: 'Faster support increases customer satisfaction and retention, directly supporting revenue growth.',
      created_at: new Date().toISOString()
    }
  ]
  
  localStorage.setItem('demo-imported-actions', JSON.stringify(demoActions))
  localStorage.setItem('demo-imported-goals', JSON.stringify(demoGoals))
}
