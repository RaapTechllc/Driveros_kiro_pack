# Dashboard Enhancements Plan

**Created:** 2026-01-08
**Scope:** 4 features for hackathon polish

---

## Feature 1: Goal Progress Tracking

### Description
Add visual progress indicators to department goals showing current vs target values with percentage completion. Goals display in a dedicated section below the Signal Board with progress bars and status badges.

### User Story
As a business owner, I want to see how close each goal is to completion.
So I can prioritize actions that move the needle on lagging goals.

### Files to Read First
- `lib/demo-data.ts` (goal structure with current/target)
- `app/dashboard/page.tsx` (current dashboard layout)
- `components/dashboard/BusinessMetrics.tsx` (card patterns)

### Files to Create/Modify
| Action | Path |
|--------|------|
| Create | `components/dashboard/GoalProgress.tsx` |
| Modify | `app/dashboard/page.tsx` |

### Tasks
1. Create `GoalProgress.tsx` with progress bar component
2. Calculate percentage: `(current / target) * 100`
3. Add status color: green (≥70%), yellow (40-69%), red (<40%)
4. Render North Star goal with large progress indicator
5. Render department goals in 3-column grid
6. Add to dashboard below Signal Board

### Validation Commands
```bash
npm run build
npm test
```

### Test Cases
- Unit: Progress calculation handles null/zero values
- Unit: Status color mapping matches thresholds
- E2E: Goal progress section visible on dashboard

### Demo Steps
1. Complete Full Audit
2. View Dashboard → see Goal Progress section
3. North Star shows 42.5% ($850K of $2M ARR)
4. Department goals show individual progress bars

---

## Feature 2: Action Status Updates

### Description
Add clickable status toggles to action cards allowing users to mark actions as todo/doing/done. Status persists to localStorage and updates the card's visual appearance.

### User Story
As a team lead, I want to mark actions as complete when finished.
So I can track progress and see what remains.

### Files to Read First
- `app/dashboard/page.tsx` (action rendering)
- `lib/types.ts` (action interface)
- `lib/imported-data.ts` (localStorage patterns)

### Files to Create/Modify
| Action | Path |
|--------|------|
| Create | `lib/action-status.ts` |
| Create | `components/dashboard/ActionCard.tsx` |
| Modify | `app/dashboard/page.tsx` |

### Tasks
1. Create `action-status.ts` with localStorage CRUD for action statuses
2. Create `ActionCard.tsx` with status toggle button
3. Add status badge: todo (gray), doing (blue), done (green + strikethrough)
4. Save status changes to localStorage keyed by action title hash
5. Load saved statuses on dashboard mount
6. Filter done actions to collapsed "Completed" section

### Validation Commands
```bash
npm run build
npm test
```

### Test Cases
- Unit: Status toggle cycles todo → doing → done → todo
- Unit: localStorage persistence works correctly
- E2E: Click action → status changes → persists on reload

### Demo Steps
1. View Dashboard with actions
2. Click status badge on "Implement WIP limits"
3. Badge changes from "todo" to "doing"
4. Refresh page → status persists

---

## Feature 3: Engine Trend History

### Description
Store engine scores over time (max 12 weeks) and display a simple sparkline or mini-chart showing trend direction. Each engine card shows an up/down/flat arrow based on recent movement.

### User Story
As a CEO, I want to see if my engines are improving or declining.
So I can celebrate wins and address regressions quickly.

### Files to Read First
- `lib/full-audit-analysis.ts` (engine scoring)
- `components/dashboard/BusinessMetrics.tsx` (EngineCard)
- `lib/demo-data.ts` (engine structure)

### Files to Create/Modify
| Action | Path |
|--------|------|
| Create | `lib/engine-history.ts` |
| Modify | `components/dashboard/BusinessMetrics.tsx` |

### Tasks
1. Create `engine-history.ts` with localStorage array storage
2. On audit save, append current scores with timestamp
3. Keep max 12 entries (rolling window)
4. Calculate trend: compare latest to 4-week-ago score
5. Add trend arrow to EngineCard: ↑ (improved ≥5), ↓ (declined ≥5), → (stable)
6. Show "New" badge if fewer than 2 data points

### Validation Commands
```bash
npm run build
npm test
```

### Test Cases
- Unit: Trend calculation handles edge cases (1 entry, identical scores)
- Unit: Rolling window caps at 12 entries
- E2E: Complete audit twice → trend arrows appear

### Demo Steps
1. Complete Full Audit → see "New" badges on engines
2. (Simulate) Add historical data via console
3. Refresh → see trend arrows (↑ for Leadership, ↓ for Finance)

---

## Feature 4: Team Member Assignment

### Description
Allow assigning specific team member names to actions instead of just roles. Stores a simple team roster in localStorage and provides a dropdown on action cards.

### User Story
As an owner, I want to assign actions to specific people by name.
So there's clear accountability beyond just "Ops" or "Sales".

### Files to Read First
- `lib/types.ts` (User interface exists but unused)
- `app/dashboard/page.tsx` (action rendering)
- `.kiro/steering/domain-model.md` (User object spec)

### Files to Create/Modify
| Action | Path |
|--------|------|
| Create | `lib/team-roster.ts` |
| Create | `components/dashboard/TeamAssignment.tsx` |
| Modify | `components/dashboard/ActionCard.tsx` |

### Tasks
1. Create `team-roster.ts` with simple name/role storage (max 10 members)
2. Create `TeamAssignment.tsx` dropdown component
3. Add "Add Team Member" mini-form (name + role)
4. Store assignments keyed by action title hash
5. Display assigned name on action card (fallback to role if unassigned)
6. Persist roster and assignments to localStorage

### Validation Commands
```bash
npm run build
npm test
```

### Test Cases
- Unit: Roster CRUD operations work correctly
- Unit: Assignment persists and loads
- E2E: Add team member → assign to action → name displays

### Demo Steps
1. View Dashboard → click "Assign" on an action
2. Add team member "Sarah Chen" with role "Ops"
3. Select Sarah for "Implement WIP limits" action
4. Card now shows "Sarah Chen" instead of "Ops"

---

## Implementation Priority

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| P1 | Action Status Updates | Small | High - immediate interactivity |
| P2 | Goal Progress Tracking | Small | High - visual clarity |
| P3 | Team Member Assignment | Medium | Medium - personalization |
| P4 | Engine Trend History | Medium | Medium - requires multiple audits |

**Recommended order:** 1 → 2 → 3 → 4

---

## Shared Patterns

All features follow existing patterns:
- localStorage for persistence (no backend)
- TypeScript interfaces in `lib/types.ts`
- Tailwind CSS with light/dark theme tokens
- Card-based UI from `components/ui/Card`
- Badge variants for status indicators

## Scope Compliance

✅ No external integrations
✅ Max 3 departments (goals respect this)
✅ Weekly Accelerator cadence (unchanged)
✅ One sentence rationale (action cards already have this)
✅ CSV export compatibility (status field already in schema)
