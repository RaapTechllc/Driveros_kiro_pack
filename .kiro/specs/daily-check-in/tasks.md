# Tasks - Daily Check-In

## Task 1: Add Daily Check-In UI
- Create `components/meetings/DailyCheckInCard.tsx` with three prompts and submit.
- Add route `/check-in` or embed in `app/dashboard/page.tsx`.

## Task 2: Wire data layer
- Use `getTodayCheckIn`, `createCheckIn` (add update helper if needed).
- Pass `org_id` and `user_id` via `useOrg` + `useAuth`.

## Task 3: Status indicator
- Show “complete/incomplete” state on dashboard header or card.

## Task 4: Validation + error states
- Client validation and graceful error handling for duplicate check-ins.

## Task 5: Tests
- Unit test any new helper.
- Add UI test if feasible.
