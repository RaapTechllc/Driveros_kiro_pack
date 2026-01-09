# Domain model (contract)

## Versioning
- schema_version: "1.0"
- Every analysis payload must include schema_version.

## Core objects
Tenant (org)
- id
- name

Company
- id
- tenant_id
- industry
- size_band
- north_star_goal_id

User
- id
- company_id
- name (optional in MVP)
- role: "Owner|CEO|Leader|Ops|Sales|Finance|HR"

Department (MVP cap = 3)
- id
- company_id
- name
- owner_user_id (optional)

IntakeSubmission
- id
- company_id
- mode: "flash|audit"
- submitted_by_user_id
- completion_score: 0..1
- answers: object (questionnaire keys -> values)
- created_at

Goal
- id
- company_id
- parent_goal_id (null for North Star)
- level: "north_star|department"
- department_id (only for department goals)
- title
- metric: string (optional)
- current: number|null
- target: number|null
- due_date: ISO string|null
- alignment_statement: string (one sentence)
- status: "on_track|at_risk|off_track"
- created_at

Action
- id
- company_id
- goal_id
- engine: "Leadership|Operations|Marketing & Sales|Finance|Personnel"
- title
- why (one sentence)
- owner_role: "Owner|Ops|Sales|Finance"
- eta_days: integer
- status: "todo|doing|done"
- due_date: ISO string|null
- created_at

Meeting
- id
- company_id
- type: "warm_up|pit_stop|full_tune_up"
- scheduled_for: ISO string|null
- notes: string|null
- decisions: string[] (short bullets)
- action_ids: string[]
- created_at

## Analysis output payload (runtime + API)
This is what the UI consumes.

{
  "schema_version": "1.0",
  "status": "ok|needs_more_data",
  "mode": "flash|audit",
  "completion_score": 0.0,
  "confidence_score": 0.0, // flash only
  "company": { "industry": "", "role": "", "size_band": "" },

  "gear": { "number": 1, "label": "Idle|Grip|Drive|Overdrive|Apex", "reason": "" },

  "engines": [
    { "name": "Leadership", "score": 0, "status": "green|yellow|red", "rationale": "", "next_action": "" },
    { "name": "Operations", "score": 0, "status": "green|yellow|red", "rationale": "", "next_action": "" },
    { "name": "Marketing & Sales", "score": 0, "status": "green|yellow|red", "rationale": "", "next_action": "" },
    { "name": "Finance", "score": 0, "status": "green|yellow|red", "rationale": "", "next_action": "" },
    { "name": "Personnel", "score": 0, "status": "green|yellow|red", "rationale": "", "next_action": "" }
  ],

  "accelerator": {
    "kpi": "",
    "cadence": "weekly",
    "recommended": true,
    "user_override_allowed": true,
    "notes": ""
  },

  "brakes": {
    "risk_level": "low|medium|high",
    "flags": [],
    "controls": []
  },

  "goals": {
    "north_star": {
      "title": "",
      "metric": "",
      "current": null,
      "target": null,
      "due_date": null
    },
    "departments": [
      { "department": "Ops|Sales/Marketing|Finance", "title": "", "metric": "", "current": null, "target": null, "due_date": null, "alignment_statement": "" }
    ]
  },

  "actions": {
    "do_now": [ { "title": "", "why": "", "owner_role": "Owner|Ops|Sales|Finance", "eta_days": 0, "engine": "" } ],
    "do_next": [ { "title": "", "why": "", "owner_role": "Owner|Ops|Sales|Finance", "eta_days": 0, "engine": "" } ]
  },

  "meetings": {
    "warm_up": { "duration_min": 10, "agenda": [] },
    "pit_stop": { "duration_min": 30, "agenda": [] },
    "full_tune_up": { "duration_min": 75, "agenda": [] }
  },

  "exports": {
    "actions_csv_ready": true,
    "goals_csv_ready": true
  }
}
