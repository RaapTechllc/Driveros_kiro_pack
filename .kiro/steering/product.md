# DriverOS product truth (hackathon MVP)

## What we are building
A multi-tenant web app that turns a fast intake into a clear dashboard.
It focuses on signal, not noise.

## Two onboarding modes
### 1) Flash Scan (free, fast)
Goal: instant value in under 5 minutes.

Inputs (minimal):
- industry
- company size band
- user role (Owner/CEO/Leader)
- north_star (one sentence)
- top constraint (cash | capacity | demand | delivery | people)

Outputs:
- recommended weekly Accelerator (user can override)
- 3–5 quick wins (small moves with clear owners)
- "what to answer next" checklist to unlock Full Audit

### 2) Full Audit (upgrade)
Goal: accurate scoring + aligned goals.

Inputs:
- full questionnaire (by the 5 engines)
- department setup (max 3 departments in MVP)
- role owners (who owns Ops, Sales/Marketing, Finance)

Outputs:
- gear (1–5) + one-sentence reason
- 5 engine cards (score, status, rationale, next action)
- weekly Accelerator card (KPI + target + cadence)
- brakes (risk flags) + plain controls
- action bay (do now / do next)
- meetings (Warm-Up, Pit Stop, Full Tune-Up)
- exports (CSV templates for goals + actions)

## Metaphor rules
- Gear = business phase (5 gears): Idle, Grip, Drive, Overdrive, Apex.
- Engines = 5 pillar health cards: Leadership, Operations, Marketing & Sales, Finance, Personnel.
- Accelerator = the Brick KPI (one weekly KPI that moves outcomes).
- Brakes = risks + constraints (cash crunch, capacity limits, compliance, burnout).

UI feel:
- Clean shop board.
- Gauges, cards, checklists.
- No car visuals by default.

## Hard scope fences (for hackathon)
- No external integrations (no QuickBooks, HubSpot, Slack).
- CSV import/export only.
- No payments.
- No complex permissions.
- Max 3 departments.

## Success bar
- Time-to-first-dashboard (Flash Scan) under 5 minutes.
- Flash Scan returns 3–5 quick wins every time.
- Full Audit dashboard loads in under 30 minutes after start.
- Installation is 1 command + 1 env file.
