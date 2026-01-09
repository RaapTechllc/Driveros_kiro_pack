# DriverOS PRD (Hackathon)

## One-liner
DriverOS helps a company pick one weekly **Accelerator** (North Star KPI) and turn it into **3–5 data-driven wins** fast.

## Who it is for
- Small to mid-sized operators.
- Owner/CEO and team leads.
- Teams who track too much and execute too little.

## The problem
- Goals are vague.
- Metrics are noisy.
- Teams pull in different directions.
- Meetings create activity, not progress.

## The promise
- **Flash Scan**: under 5 minutes.
- Immediate output: **1 recommended Accelerator + 3–5 quick wins**.
- Upgrade path: **Full Audit** for deeper scoring and alignment.

## Product principles
- One screen should always answer: **“What do we do next?”**
- AI recommends first. User can override with **Other**.
- One sentence rationale. Always.
- No external integrations for hackathon. CSV only.
- Light mode and dark mode. First-class.

## Core concepts
### Gear (business phase)
Five gears:
1. Idle
2. Grip
3. Drive
4. Overdrive
5. Apex

Gear is displayed as a simple card with a single-sentence reason.

### Engines (health cards)
Five engines:
- Leadership
- Operations
- Marketing & Sales
- Finance
- Personnel

Each engine card shows:
- status color (red/yellow/green)
- score (0–100) when available
- **one sentence** rationale
- next action (one clear move)

### Accelerator (the Brick)
- A single KPI that drives outcomes.
- Cadence: **weekly**.
- AI recommends by default.
- User can override with “Other”.

### Brakes
Risks and constraints:
- cash crunch
- capacity
- compliance
- burnout

Brakes appear as flags and warnings. One sentence each.

## MVP scope
### Must-have screens
1. Onboarding: Flash Scan (free)
2. Dashboard: Gear, Engines, Accelerator, Actions, Goal Alignment
3. Meetings: Warm-Up, Pit Stop, Full Tune-Up templates
4. CSV Export/Import: Actions + Goals
5. History: simple timeline of scans/audits (optional list view)

### Two-speed onboarding
#### A) Flash Scan (free)
Goal: instant value. Minimal inputs.

Required fields:
- company name (or placeholder)
- industry
- size band
- role
- top constraint (one pick)
- North Star goal (one sentence)
Optional:
- current KPI you track
- current Accelerator if known

Outputs:
- recommended Accelerator (weekly)
- gear estimate + reason
- 3–5 quick wins (titles + why + owner + ETA)
- “Next questions” checklist to unlock Full Audit
- confidence score (0–100)

#### B) Full Audit (upgrade)
Goal: real scoring and alignment.

Required:
- questionnaire inputs by engine
- compliance flags (basic)
- department setup (max 3)
- owners per department/engine

Outputs:
- engine scores + status + rationale + next action
- accelerator (weekly) + target suggestion
- actions list (do now / do next)
- meetings templates populated
- goal tree aligned to North Star

## Goal alignment model
- One **North Star** company goal.
- Up to **3** departments:
  - Operations
  - Sales/Marketing
  - Finance
- Each department can have one aligned goal.
- No goal is allowed without a parent North Star.

Rule:
> Every department goal must state how it supports the North Star in one sentence.

## CSV import/export
Two templates only.

1) Actions CSV
- title
- why
- owner (Owner|Ops|Sales|Finance)
- engine
- status
- eta_days
- due_date (optional)

2) Goals CSV
- north_star_title
- north_star_target
- timeframe
- department (optional)
- aligned_goal_title (optional)
- aligned_goal_target (optional)
- notes (optional)

## Scoring (hackathon level)
- Engine scores: map inputs to 0–100 and average by engine.
- Status bands:
  - green >= 70
  - yellow 40–69
  - red < 40
- Missing key fields:
  - Full Audit blocks if completion < 70%.
  - Flash Scan never blocks. It lowers confidence and asks for missing items.

## Meetings
- Warm-Up (10 min, daily)
- Pit Stop (30 min, weekly)
- Full Tune-Up (60–90 min, monthly/quarterly)

Each meeting produces:
- top risk (brake)
- one accelerator check-in
- 3 actions max with owners and due dates

## Non-goals (explicit)
- No QuickBooks, HubSpot, Slack, Salesforce APIs.
- No billing.
- No permissions matrix beyond basics.
- No “car culture” visuals as default.

## Success criteria (for judges)
- Install and run in minutes.
- Flash Scan produces output immediately.
- Dashboard renders clearly in light and dark mode.
- CSV export works. CSV import works.
- Tests pass:
  - unit tests for scoring
  - Playwright demo path

## Out of scope (future)
- Real integrations.
- Multi-team org charts.
- Long-term analytics and forecasting.
- Reward system with rich visuals.
