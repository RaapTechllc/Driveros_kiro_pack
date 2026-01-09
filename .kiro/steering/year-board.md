# Year Board (Year-at-a-Glance)

## Purpose
Give teams a clear view of the whole year.
Make the North Star visible at all times.
Turn strategy into a simple quarterly plan.

## Core idea
A single board shows the full year.
Items are placed into Q1–Q4.
Users can drag items between quarters.

## Naming (company-first)
- **North Star**: the one company goal for the year.
- **Plays**: 6 bigger initiatives that increase the chance of the North Star.
- **Rituals**: 4 operating habits (one per quarter).
- **Milestones**: checkpoints tied to the North Star.
- **Tune-Ups**: longer planning/review meetings.

## Hard constraints (hackathon scope)
- Departments are capped at **3**:
  - Ops
  - Sales/Marketing
  - Finance
- Plays are capped at **6** per year.
- Rituals are capped at **4** per year (one per quarter).
- North Star is **exactly 1** per year per company.
- No external integrations.
- CSV import/export only.

## Alignment rules (no orphan work)
Every Year Board item must align to the North Star.
Alignment can be:
- Direct: `linked_goal_id = north_star_goal_id`
- Indirect: item links to a department goal whose parent is the North Star

If an item has no alignment:
- Mark it as `alignment_status: "unlinked"`
- Show a warning badge: "Link to North Star"
- Do not include it in "recommended next actions"

## Board views
### View A: Year Board (default)
- Columns: Q1, Q2, Q3, Q4
- Swimlanes (rows):
  - Company
  - Ops
  - Sales/Marketing
  - Finance
- Cards: draggable between quarters and swimlanes

### View B: Quarter zoom (optional, v2)
- Click a quarter to see months/weeks.
- Place Tune-Ups and key dates.

## Card types
Each card must be one of:
- `milestone`
- `play`
- `ritual`
- `tuneup`

Each card shows:
- Title
- Type badge
- Department (or Company)
- Quarter
- Status (optional)
- One-sentence rationale (why it matters)

## Status rules (simple)
Statuses are optional for hackathon.
If used:
- `planned`
- `active`
- `blocked`
- `done`

Blocked items should also show a "Brake" note (one sentence).

## Data contract (minimum)
Store a `year_plan` and `year_items`.

### year_plan
- `id`
- `tenant_id`
- `company_id`
- `year` (YYYY)
- `north_star_goal_id`
- `created_by`
- `created_at`
- `updated_at`

### year_item
- `id`
- `year_plan_id`
- `type` (enum above)
- `title`
- `department` (`company|ops|sales_marketing|finance`)
- `quarter` (1..4)
- `status` (optional)
- `rationale` (one sentence)
- `alignment_status` (`linked|unlinked`)
- `linked_goal_id` (optional)
- `linked_engine` (optional: Leadership|Operations|Marketing & Sales|Finance|Personnel)
- `start_date` (optional, ISO)
- `end_date` (optional, ISO)
- `created_by`
- `created_at`
- `updated_at`

## AI-first generation (recommended plan)
### When to generate
- After Flash Scan: generate a starter plan.
- After Full Audit: generate a refined plan.

### What AI generates (defaults)
- 3–6 North Star milestones across the year.
- 6 Plays distributed across quarters (roughly 1–2 per quarter).
- 4 Rituals (exactly one per quarter).
- 1 Tune-Up per quarter (optional for hackathon).

### AI output rules
- Always propose items even if data is incomplete.
- Use a confidence score internally if needed.
- Keep rationale to one sentence.
- Keep titles short.
- Ensure all items are aligned to the North Star (no unlinked items in AI output).

### Override rule
Users can edit anything.
Users can add "Other" items.
If "Other" is used, still require alignment.

## UX rules
- Light and dark mode supported.
- Empty state:
  - Show "Generate my Year Plan" as the primary action.
  - Show a tiny example layout.
- Drag and drop must feel snappy.
- Confirm on delete.
- Autosave on move.

## CSV import/export
### Export: `YearBoard.csv`
Columns:
- `year`
- `type`
- `title`
- `department`
- `quarter`
- `status`
- `rationale`
- `linked_goal_title` (or `linked_goal_id`)
- `start_date`
- `end_date`

### Import rules
- If `year_plan` does not exist, create it.
- If `linked_goal_id` is missing, set `alignment_status = unlinked`.
- Validate enums. Reject rows with invalid `type/department/quarter`.

## Testing requirements
Unit tests:
- Enums validation (type, department, quarter)
- Alignment rules (linked vs unlinked)
- CSV export/import round-trip

Playwright path (minimum):
- Create Year Plan (Generate button)
- Drag an item to another quarter
- Export CSV

## Non-goals (for hackathon)
- Calendar sync
- Gantt charts
- Multi-year planning
- External integrations
