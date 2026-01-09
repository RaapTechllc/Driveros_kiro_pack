# Contracts (Schemas, CSV, Enums)

## Schema version
- schema_version: 1.0

## Enums
### Gear
- Idle
- Grip
- Drive
- Overdrive
- Apex

### Engines
- Leadership
- Operations
- Marketing & Sales
- Finance
- Personnel

### Engine status
- red
- yellow
- green
- unknown

### Owners
- Owner
- Ops
- Sales
- Finance

### Mode
- flash
- audit

## Analysis JSON (dashboard contract)
This is the shape the UI consumes.

```json
{
  "schema_version": "1.0",
  "mode": "flash",
  "company": {
    "name": "",
    "industry": "",
    "size_band": "",
    "role": ""
  },
  "north_star": {
    "title": "",
    "timeframe": "",
    "target": ""
  },
  "departments": [
    {
      "name": "Operations",
      "aligned_goal": {
        "title": "",
        "target": "",
        "supports_north_star": ""
      }
    }
  ],
  "gear": {
    "name": "Grip",
    "reason": ""
  },
  "accelerator": {
    "kpi": "",
    "cadence": "weekly",
    "recommendation_reason": "",
    "user_override": false
  },
  "engines": [
    {
      "name": "Leadership",
      "score": 0,
      "status": "yellow",
      "rationale": "",
      "next_action": ""
    }
  ],
  "brakes": [
    {
      "type": "cash|capacity|compliance|burnout|other",
      "note": ""
    }
  ],
  "actions": [
    {
      "title": "",
      "why": "",
      "owner": "Owner",
      "engine": "Operations",
      "eta_days": 7,
      "status": "todo"
    }
  ],
  "confidence_score": 0
}
```

Notes:
- Flash Scan uses confidence_score.
- Full Audit enforces completion threshold.

## CSV templates

### Actions CSV
Required columns:
- title
- why
- owner
- engine
- status
- eta_days

Optional:
- due_date

Example header:
```csv
title,why,owner,engine,status,eta_days,due_date
```

### Goals CSV
Required:
- north_star_title
- timeframe

Recommended:
- north_star_target
- department
- aligned_goal_title
- aligned_goal_target
- notes

Example header:
```csv
north_star_title,north_star_target,timeframe,department,aligned_goal_title,aligned_goal_target,notes
```

## Constraints
- Max departments: 3 (Operations, Sales/Marketing, Finance)
- One North Star per company
- One sentence rationale fields:
  - gear.reason
  - engine.rationale
  - accelerator.recommendation_reason
  - aligned_goal.supports_north_star
