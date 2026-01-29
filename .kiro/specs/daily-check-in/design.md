# Design - Daily Check-In

## Architecture Overview
- **UI**: New `DailyCheckInCard` component placed on Dashboard or `/check-in` route.
- **Data**: Use existing `lib/data/meetings.ts` check-in functions (`getTodayCheckIn`, `createCheckIn`).
- **Auth/Org Context**: Use `useAuth` + `useOrg` for `user_id` and `org_id`.

## Data Flow
1. Load today’s check-in via `getTodayCheckIn(userId, orgId)` on component mount.
2. Render three inputs: action completion (boolean), blocker (text), win/lesson (text).
3. On submit, call `createCheckIn` with `{ user_id, date, actions_completed, blocker, win_or_lesson, action_updates }`.
4. If a record exists, update via `createCheckIn` guard + `update` (add a new helper if needed).

## UI Behavior
- Single screen with three prompts and submit button.
- If a check-in exists, prefill fields and show “Update” state.
- Surface a small status indicator on Dashboard showing today complete/incomplete.

## Error Handling
- Show inline errors for validation and submission failures.
- Handle duplicate check-in constraint (same org/user/date) by switching to update.

## Testing Strategy
- Unit tests for check-in utilities if new helper is added.
- UI tests for submit + edit flow (if E2E exists).
