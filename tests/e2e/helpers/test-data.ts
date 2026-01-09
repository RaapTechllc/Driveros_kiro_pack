export const testData = {
  flashScan: {
    industry: 'Technology',
    size_band: '11-50 employees',
    role: 'Owner',
    north_star: 'Reach $2M ARR by end of year with 20% profit margin',
    top_constraint: 'demand'
  },

  fullAudit: {
    // Leadership Engine
    vision_clarity: 4,
    decision_speed: 3,
    team_alignment: 4,

    // Operations Engine
    process_efficiency: 3,
    quality_control: 4,
    delivery_reliability: 3,

    // Marketing & Sales Engine
    lead_generation: 2,
    conversion_rate: 3,
    customer_retention: 4,

    // Finance Engine
    cash_flow_health: 3,
    profitability: 2,
    financial_planning: 3,

    // Personnel Engine
    team_satisfaction: 4,
    skill_gaps: 2,
    retention_risk: 3
  }
}

export const expectedResults = {
  flashScan: {
    acceleratorKPI: 'Weekly Active Users',
    quickWinsCount: 4, // 1 role-specific + 3 from demand constraint
    gearNumber: 2
  },

  fullAudit: {
    engineCount: 5,
    gearRange: [1, 5],
    actionCategories: ['do_now', 'do_next']
  }
}
