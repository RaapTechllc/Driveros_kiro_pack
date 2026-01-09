# Dashboard Enhancements Plan

Four features to enhance the dashboard: Goal Progress Tracking, Action Status Updates, Engine Trend History, and Dashboard Filters.

---

## Feature 1: Goal Progress Tracking (Enhancement)

### Description
Enhance the existing `GoalProgress` component to allow users to update `current` values directly from the dashboard, persisting changes to localStorage.

### User Story
- As a user, I want to update my goal progress from the dashboard.
- So that I can track my North Star and department goals without re-running the audit.

### Files to Read First
- `components/dashboard/GoalProgress.tsx` (existing component)
- `lib/types.ts` (Goal interface from domain model)
- `.kiro/steering/goals.md` (alignment rules)

### Files to Create/Modify
| Action | Path |
|--------|------|
| Create | `lib/goal-progress.ts` |
| Modify | `components/dashboard/GoalProgress.tsx` |
| Create | `__tests__/goal-progress.test.ts` |

### Step-by-Step Tasks
1. Create `lib/goal-progress.ts` with:
   - `getGoalProgress(goalTitle: string): number | null`
   - `setGoalProgress(goalTitle: string, current: number): void`
   - localStorage key: `goal-progress`

2. Modify `GoalProgress.tsx`:
   - Add editable input for `current` value on each goal card
   - On blur/enter, persist via `setGoalProgress()`
   - Show "Updated" indicator briefly after save

3. Write unit test for persistence functions

### Validation Commands
```bash
npm test -- goal-progress
npm run build
```

### Test Cases
- Unit: `setGoalProgress` stores value, `getGoalProgress` retrieves it
- Unit: Progress percentage recalculates after update
- E2E: Update North Star current value → see progress bar change

### Demo Steps
1. Complete Full Audit → Dashboard shows Goal Progress
2. Click on North Star current value → edit inline
3. Enter new number → progress bar updates
4. Refresh page → value persists

---

## Feature 2: Action Status Updates (Already Implemented ✅)

### Description
Action status cycling (todo → doing → done) already exists in `ActionCard.tsx` using `lib/action-status.ts`. No new work needed.

### Current Implementation
- `ActionCard` has clickable status badge
- `cycleStatus()` rotates through todo/doing/done
- `setActionStatus()` persists to localStorage
- Visual feedback: done items show strikethrough

### Validation
```bash
npm test -- action-status
```

**Status: COMPLETE - No changes needed**

---

## Feature 3: Engine Trend History (Enhancement)

### Description
Enhance the existing engine trend system to show a mini sparkline or trend indicator on each `EngineCard`, and add a "Save Snapshot" button to capture current scores.

### User Story
- As a user, I want to see how my engine scores trend over time.
- So that I can track improvement or decline across audits.

### Files to Read First
- `lib/engine-history.ts` (existing - has `saveEngineSnapshot`, `calcTrend`)
- `components/dashboard/BusinessMetrics.tsx` (EngineCard component)
- `app/dashboard/page.tsx` (already calculates trends)

### Files to Create/Modify
| Action | Path |
|--------|------|
| Modify | `components/dashboard/BusinessMetrics.tsx` |
| Modify | `app/dashboard/page.tsx` |
| Create | `__tests__/engine-history.test.ts` |

### Step-by-Step Tasks
1. Add "Save Snapshot" button to dashboard (below Signal Board)
   - Calls `saveEngineSnapshot()` with current engine scores
   - Shows toast/indicator "Snapshot saved"

2. Enhance `EngineCard` to display trend arrow with color:
   - up: green ↑
   - down: red ↓
   - stable: gray →
   - new: blue ●

3. Write unit tests for `calcTrend()` edge cases

### Validation Commands
```bash
npm test -- engine-history
npm run build
```

### Test Cases
- Unit: `calcTrend` returns 'up' when score increased by 5+
- Unit: `calcTrend` returns 'down' when score decreased by 5+
- Unit: `calcTrend` returns 'stable' for small changes
- Unit: `calcTrend` returns 'new' with <2 snapshots
- E2E: Save snapshot → refresh → trend shows on cards

### Demo Steps
1. Complete Full Audit → see engine cards
2. Click "Save Snapshot" → confirmation appears
3. Run another audit with different answers
4. Dashboard shows trend arrows on engine cards

---

## Feature 4: Dashboard Filters

### Description
Add filter controls to the Action Bay to filter actions by engine, owner role, or status.

### User Story
- As a user, I want to filter my actions by engine or owner.
- So that I can focus on specific areas during team meetings.

### Files to Read First
- `app/dashboard/page.tsx` (Action Bay section)
- `components/dashboard/ActionCard.tsx` (action display)
- `.kiro/steering/domain-model.md` (engine and role enums)

### Files to Create/Modify
| Action | Path |
|--------|------|
| Create | `components/dashboard/ActionFilters.tsx` |
| Modify | `app/dashboard/page.tsx` |

### Step-by-Step Tasks
1. Create `ActionFilters.tsx`:
   - Three dropdowns: Engine, Owner Role, Status
   - Engine options: All, Leadership, Operations, Marketing & Sales, Finance, Personnel
   - Owner options: All, Owner, Ops, Sales, Finance
   - Status options: All, Todo, Doing, Done
   - Emit `onFilterChange({ engine, owner, status })`

2. Modify `app/dashboard/page.tsx`:
   - Add filter state: `useState({ engine: 'all', owner: 'all', status: 'all' })`
   - Filter actions before rendering in Do Now / Do Next sections
   - Place `<ActionFilters>` above Action Bay cards

3. No persistence needed (filters reset on page load)

### Validation Commands
```bash
npm run build
npx playwright test dashboard
```

### Test Cases
- E2E: Select "Operations" engine → only Operations actions show
- E2E: Select "Owner" role → only Owner-assigned actions show
- E2E: Select "Done" status → only completed actions show
- E2E: Reset to "All" → all actions visible

### Demo Steps
1. Dashboard with multiple actions across engines
2. Select "Finance" from engine filter → list narrows
3. Select "Ops" from owner filter → further filtered
4. Click "All" to reset → full list returns

---

## Summary

| Feature | Status | Effort | Priority |
|---------|--------|--------|----------|
| Goal Progress Tracking | New | Small | P2 |
| Action Status Updates | ✅ Done | - | - |
| Engine Trend History | Enhancement | Small | P2 |
| Dashboard Filters | New | Medium | P3 |

### Recommended Order
1. Engine Trend History (builds on existing code)
2. Goal Progress Tracking (similar pattern to action-status)
3. Dashboard Filters (new UI, more testing)

### Total Estimated Time
- Engine Trend: 30 min
- Goal Progress: 45 min
- Dashboard Filters: 60 min
- **Total: ~2.5 hours**
