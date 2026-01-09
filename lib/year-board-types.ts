export interface YearPlan {
  id: string
  tenant_id: string
  company_id: string
  year: number
  north_star_goal_id?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface YearItem {
  id: string
  year_plan_id: string
  type: 'milestone' | 'play' | 'ritual' | 'tuneup'
  title: string
  department: 'company' | 'ops' | 'sales_marketing' | 'finance'
  quarter: 1 | 2 | 3 | 4
  status?: 'planned' | 'active' | 'blocked' | 'done'
  rationale: string
  alignment_status: 'linked' | 'unlinked'
  linked_goal_id?: string
  linked_engine?: string
  start_date?: string
  end_date?: string
  created_by: string
  created_at: string
  updated_at: string
}
