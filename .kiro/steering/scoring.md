# Scoring rules

## Modes
There are two modes: flash and audit.

- flash: fast heuristic outputs. No strict completeness gate.
- audit: full scoring. Enforce completion threshold.

## Completeness
### Audit completeness rule
completion_score = answered_required_fields / required_required_fields

If completion_score < 0.70:
- status = "needs_more_data"
- return missing_fields (exact keys)
- stop

### Flash completeness rule
Do not block.
Return:
- confidence_score (0..1)
- missing_fields checklist

## Engine scoring (audit)
- Normalize each numeric answer to 0..100.
- Each engine score = average of its mapped inputs.
- If a key engine input is missing, set that engine to "unknown" in UI and prompt for missing data.

Status bands:
- green: score >= 70
- yellow: 40–69
- red: < 40

Rationale (one sentence):
- State the top gap.
- Name the lever.
Example: "Ops is red because work is stuck in progress; add a weekly WIP cap and a single owner."

## Gear selection (audit)
Compute avg_engine_score from known engines.
Map:
- 0–39  -> 1 Idle
- 40–54 -> 2 Grip
- 55–69 -> 3 Drive
- 70–84 -> 4 Overdrive
- 85–100 -> 5 Apex

If fewer than 3 engines are known, gear is "Grip" with reason: "Need more inputs to size your phase."

## Accelerator (weekly)
Always recommend a weekly Accelerator.
User can override with "Other".

If user provided a KPI, keep it.
If missing, recommend based on the top constraint:

- cash      -> "Cash collected this week" (or "Net cash change")
- capacity  -> "Jobs completed this week" (or "WIP limit adherence")
- demand    -> "Qualified leads this week"
- delivery  -> "On-time delivery rate this week"
- people    -> "Hiring pipeline velocity" (or "Retention risk count")

Notes rules:
- Use plain language.
- Tie the KPI to the North Star.

## Quick wins (flash)
Return 3–5 wins.
Each win must be:
- doable in 1–7 days
- measurable
- assigned to an owner role

Pick wins from:
- pick one weekly Accelerator and delete extra metrics
- set a 30-min weekly Pit Stop and commit to 3 actions
- assign one owner per engine (even if part-time)
- define one brake limit (cash runway floor or WIP cap)
- create a simple goal tree: North Star + 3 department goals

## Goals
- One North Star per company.
- Max 3 department goals in MVP.
- Every department goal must include alignment_statement (one sentence).
- Department goals must not conflict with each other.

Default departments (if user does not name them):
- Ops
- Sales/Marketing
- Finance
