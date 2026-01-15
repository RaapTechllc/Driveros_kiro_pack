# Test Plan

## Goal
Prove the app works end-to-end for judges.

## Unit tests (must)
1) Accelerator recommendation
- Given minimal Flash Scan inputs, returns a weekly KPI and a one sentence reason.
- Allows user override with Other.

2) Gear selection
- Maps constraints and size band to one of 5 gear names.
- Always returns one sentence reason.

3) Engine scoring (Full Audit)
- Normalizes inputs 0–100.
- Averages by engine.
- Status bands match spec.

4) Completion threshold (Full Audit)
- completion < 70% returns needs_more_data and missing fields list.

## Playwright tests (must)
### Path: Flash Scan → Dashboard
- Start Flash Scan
- Fill required fields
- Submit
- Assert:
  - Accelerator card visible
  - 5 engine cards visible
  - At least 3 actions visible

### Path: Meetings
- Open Pit Stop
- Generate actions
- Assert:
  - max 3 actions
  - each has owner and eta

### Path: CSV Export
- Click Export Actions
- Assert download triggered

### Optional: CSV Import
- Upload a small Actions CSV
- Assert actions list updates

## “Golden data” approach
- Store 2 seed companies (see SEED_DATA.md).
- Snapshot expected outputs for deterministic tests.
