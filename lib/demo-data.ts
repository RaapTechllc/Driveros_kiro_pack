import { FullAuditResult, FlashScanResult } from './types'

// Realistic tech startup demo data
export const DEMO_COMPANY = {
  name: "TechFlow Solutions",
  industry: "Tech",
  size: "11-50",
  role: "Owner",
  northStar: "Reach $2M ARR by Dec 2026 with 25% net margin",
  constraint: "capacity"
}

export const DEMO_FLASH_RESULT: FlashScanResult = {
  schema_version: "1.0",
  confidence_score: 0.85,
  accelerator: {
    kpi: "Weekly Active Users",
    cadence: "weekly",
    recommended: true,
    notes: "Focus on user engagement to drive revenue growth"
  },
  gear_estimate: {
    number: 3,
    label: "Drive",
    reason: "Growing team with capacity constraints but strong fundamentals"
  },
  quick_wins: [
    {
      title: "Set WIP limit for active projects",
      why: "Prevents work bottlenecks",
      owner_role: "Ops",
      eta_days: 1,
      engine: "Operations"
    },
    {
      title: "Assign single owner per project", 
      why: "Eliminates accountability gaps",
      owner_role: "Owner",
      eta_days: 2,
      engine: "Leadership"
    },
    {
      title: "Schedule 15-min daily standups",
      why: "Surfaces blockers faster", 
      owner_role: "Ops",
      eta_days: 1,
      engine: "Operations"
    },
    {
      title: "Track weekly qualified leads",
      why: "Measures pipeline health",
      owner_role: "Sales", 
      eta_days: 2,
      engine: "Marketing & Sales"
    }
  ]
}

export const DEMO_FULL_AUDIT_RESULT: FullAuditResult = {
  schema_version: "1.0",
  status: "ok",
  mode: "audit", 
  completion_score: 1.0,
  company: {
    industry: "Tech",
    role: "Owner",
    size_band: "11-50"
  },
  gear: {
    number: 3,
    label: "Drive", 
    reason: "Strong leadership and sales, but operations need optimization"
  },
  engines: [
    {
      name: "Leadership",
      score: 78,
      status: "green",
      rationale: "Clear vision and team alignment, minor delegation gaps",
      next_action: "Document decision-making process for key areas"
    },
    {
      name: "Operations", 
      score: 52,
      status: "yellow",
      rationale: "Work gets stuck in progress, needs better flow management",
      next_action: "Implement WIP limits and weekly throughput tracking"
    },
    {
      name: "Marketing & Sales",
      score: 71,
      status: "green", 
      rationale: "Good pipeline but conversion could improve",
      next_action: "Analyze top 3 lost deals for pattern insights"
    },
    {
      name: "Finance",
      score: 45,
      status: "yellow",
      rationale: "Cash flow tracking exists but forecasting is weak", 
      next_action: "Build 13-week rolling cash forecast"
    },
    {
      name: "Personnel",
      score: 63,
      status: "yellow",
      rationale: "Team is engaged but growth planning needs structure",
      next_action: "Create hiring roadmap aligned to revenue targets"
    }
  ],
  accelerator: {
    kpi: "Weekly Active Users",
    cadence: "weekly", 
    recommended: true,
    user_override_allowed: true,
    notes: "User engagement drives retention and expansion revenue"
  },
  brakes: {
    risk_level: "medium",
    flags: ["Capacity constraints limiting growth", "Cash flow forecasting gaps"],
    controls: ["Monitor team utilization weekly", "Review cash position bi-weekly"]
  },
  goals: {
    north_star: {
      title: "Reach $2M ARR by Dec 2026 with 25% net margin",
      metric: "Annual Recurring Revenue",
      current: 850000,
      target: 2000000,
      due_date: "2026-12-31"
    },
    departments: [
      {
        department: "Ops",
        title: "Reduce delivery cycle time to 14 days",
        metric: "Average cycle time",
        current: 21,
        target: 14, 
        due_date: "2026-06-30",
        alignment_statement: "Faster delivery increases capacity and customer satisfaction"
      },
      {
        department: "Sales/Marketing",
        title: "Achieve 15% monthly lead conversion rate", 
        metric: "Lead conversion rate",
        current: 8,
        target: 15,
        due_date: "2026-09-30",
        alignment_statement: "Higher conversion drives revenue without increasing acquisition costs"
      },
      {
        department: "Finance", 
        title: "Maintain 6-month cash runway minimum",
        metric: "Cash runway months",
        current: 4,
        target: 6,
        due_date: "2026-03-31",
        alignment_statement: "Cash runway provides stability for growth investments"
      }
    ]
  },
  actions: {
    do_now: [
      {
        title: "Implement WIP limits for development team",
        why: "Prevents bottlenecks and improves flow",
        owner_role: "Ops", 
        eta_days: 3,
        engine: "Operations"
      },
      {
        title: "Build 13-week rolling cash forecast",
        why: "Improves financial planning and risk management",
        owner_role: "Finance",
        eta_days: 5, 
        engine: "Finance"
      },
      {
        title: "Analyze top 3 lost deals for patterns",
        why: "Identifies conversion improvement opportunities", 
        owner_role: "Sales",
        eta_days: 7,
        engine: "Marketing & Sales"
      }
    ],
    do_next: [
      {
        title: "Document decision-making process",
        why: "Scales leadership effectiveness",
        owner_role: "Owner",
        eta_days: 14,
        engine: "Leadership" 
      },
      {
        title: "Create hiring roadmap for next 6 months",
        why: "Aligns team growth with revenue targets",
        owner_role: "Owner", 
        eta_days: 10,
        engine: "Personnel"
      },
      {
        title: "Set up weekly throughput tracking",
        why: "Provides data for continuous improvement",
        owner_role: "Ops",
        eta_days: 7,
        engine: "Operations"
      }
    ]
  },
  meetings: {
    warm_up: {
      duration_min: 10,
      agenda: ["Weekly Active Users progress", "Top blocker identification", "One action assignment"]
    },
    pit_stop: {
      duration_min: 30, 
      agenda: ["Accelerator results review", "Engine status check", "Action prioritization"]
    },
    full_tune_up: {
      duration_min: 75,
      agenda: ["North Star alignment check", "Goal progress review", "Strategic planning"]
    }
  },
  exports: {
    actions_csv_ready: true,
    goals_csv_ready: true
  }
}
