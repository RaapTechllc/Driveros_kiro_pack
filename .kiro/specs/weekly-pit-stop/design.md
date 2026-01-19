# Design - Weekly Pit Stop

## Architecture Overview
- **UI**: New Pit Stop screen (reuse `/meetings` or `/pit-stop` route).
- **Data**: Use existing `lib/data/actions.ts` and `lib/data/meetings.ts`.
- **Plan Generation**: Initial rules-engine placeholder; AI operation wired later.

## Data Flow
1. Load last week actions (completed/missed) from `getActions` filtered by date/status.
2. Gather inputs: North Star (future), accelerator trend, blockers.
3. Generate a proposed plan (max 3 actions) using rules engine.
4. On approval, create actions via `createAction` and store `meeting` of type `pit_stop` with decisions.

## UI Behavior
- Show “Last Week Summary” panel (done/missed).
- Show proposed plan list with edit capability.
- “Approve Plan” creates actions and logs a pit stop meeting.

## Error Handling
- Validation for max 3 actions.
- Graceful fallback if rule generation fails (empty state + manual entry).

## Testing Strategy
- Unit tests for plan generation rules.
- Integration test for approval -> action creation.
