# Feature Plan: Year Board (Jesse Itzler-style Year-at-a-Glance)

## Feature Description
Build a drag-and-drop Year Board showing Q1-Q4 columns with Company/Ops/Sales/Marketing/Finance swimlanes, displaying milestone/play/ritual/tuneup cards that align to the North Star. Includes AI-first plan generation, CSV import/export, and autosave persistence for annual strategic planning within DriverOS.

## User Story
As a business owner using DriverOS,  
I want a visual year-at-a-glance board so I can plan quarterly milestones, plays, and rituals that align to my North Star goal.

## Files to Read First
- `.kiro/steering/year-board.md` - Complete feature specification
- `.kiro/steering/domain-model.md` - Data contract requirements
- `.kiro/steering/scope.md` - Hackathon constraints
- `lib/types.ts` - Existing type definitions
- `components/import/FileUpload.tsx` - Drag/drop patterns
- `app/dashboard/page.tsx` - Layout and persistence patterns

## Files to Create/Modify

### New Files
- `app/year-board/page.tsx` - Main Year Board page
- `components/year-board/YearBoard.tsx` - Board layout component
- `components/year-board/YearCard.tsx` - Draggable card component
- `components/year-board/QuarterColumn.tsx` - Q1-Q4 column component
- `components/year-board/DepartmentLane.tsx` - Swimlane component
- `components/year-board/GeneratePlanButton.tsx` - AI plan generator
- `components/year-board/CardEditModal.tsx` - Edit card modal
- `components/year-board/EmptyState.tsx` - Empty board state
- `lib/year-board-generator.ts` - Plan generation logic
- `lib/year-board-storage.ts` - Data persistence utilities
- `lib/year-board-csv.ts` - CSV import/export
- `lib/year-board-types.ts` - Year Board type definitions
- `__tests__/year-board-generator.test.ts` - Generator unit tests
- `__tests__/year-board-csv.test.ts` - CSV unit tests
- `tests/e2e/year-board.spec.ts` - E2E tests

### Modified Files
- `lib/types.ts` - Add Year Board interfaces
- `components/layout/Sidebar.tsx` - Add Year Board navigation
- `app/layout.tsx` - Add Year Board route
- `DEVLOG.md` - Document implementation progress
- `README.md` - Update demo steps

## Step-by-Step Tasks

### Slice 1: Routes + Page Shell + Board Layout
1. Create `/year-board` route and page component
2. Build responsive Q1-Q4 column layout with CSS Grid
3. Add Company/Ops/Sales/Marketing/Finance swimlanes
4. Implement light/dark mode styling
5. Add navigation link in sidebar

### Slice 2: Data Model + CRUD + Persistence
6. Define YearPlan and YearItem interfaces in types
7. Create localStorage-based storage utilities
8. Implement autosave on drag/drop operations
9. Add CRUD operations for year items
10. Build drag-and-drop functionality with HTML5 DnD API

### Slice 3: Plan Generator
11. Create year plan generator with heuristic rules
12. Generate 3-6 milestones, 6 plays, 4 rituals
13. Ensure all generated items align to North Star
14. Handle missing North Star with unlinked status
15. Add "Generate my Year Plan" button and logic

### Slice 4: Card UI + Edit/Delete + Empty State
16. Build YearCard component with type badges
17. Add alignment status badges for unlinked items
18. Create card edit modal with form validation
19. Implement delete confirmation dialog
20. Design empty state with example layout

### Slice 5: CSV Export/Import + Validation
21. Build CSV export with all required columns
22. Create CSV import with enum validation
23. Handle unlinked items during import
24. Add error handling and user feedback
25. Integrate with existing export UI patterns

### Slice 6: Tests + Polish
26. Write unit tests for generator logic
27. Add CSV round-trip tests
28. Create Playwright E2E test suite
29. Polish drag/drop animations and feedback
30. Final demo preparation and documentation

## Validation Commands
```bash
npm test -- year-board
npm run build
npx playwright test tests/e2e/year-board.spec.ts
npm run dev
```

## Test Cases

### Unit Tests
- **Generator Logic**: Verify correct counts (6 plays, 4 rituals, 3-6 milestones)
- **Enum Validation**: Test type/department/quarter/status validation
- **Alignment Rules**: Test linked vs unlinked status logic
- **CSV Round-trip**: Export then import should preserve data
- **Storage Utilities**: Test CRUD operations and autosave

### E2E Tests
- **Board Rendering**: Year Board loads with correct layout
- **Plan Generation**: Click "Generate" creates cards in correct quantities
- **Drag and Drop**: Move card from Q1 to Q2, verify persistence after refresh
- **Card Editing**: Edit card title and rationale, verify save
- **CSV Export**: Download CSV file with correct format
- **CSV Import**: Upload CSV and verify cards appear on board

## Demo Steps (Judge Experience)

1. **Navigation**: Click "Year Board" in sidebar → Board loads instantly
2. **Empty State**: See clean layout with "Generate my Year Plan" CTA
3. **Plan Generation**: Click generate → 13+ cards appear across quarters and departments
4. **Visual Layout**: See Q1-Q4 columns with Company/Ops/Sales/Finance swimlanes
5. **Drag and Drop**: Move a milestone from Q2 to Q3 → Autosaves immediately
6. **Card Details**: Each card shows type badge, title, rationale, alignment status
7. **CSV Export**: Download YearBoard.csv with all planning data
8. **Persistence**: Refresh page → All changes preserved

## Data Model Changes

### New Interfaces
```typescript
interface YearPlan {
  id: string
  tenant_id: string
  company_id: string
  year: number
  north_star_goal_id?: string
  created_by: string
  created_at: string
  updated_at: string
}

interface YearItem {
  id: string
  year_plan_id: string
  type: 'milestone' | 'play' | 'ritual' | 'tuneup'
  title: string
  department: 'company' | 'ops' | 'sales_marketing' | 'finance'
  quarter: 1 | 2 | 3 | 4
  status?: 'planned' | 'active' | 'blocked' | 'done'
  rationale: string
  alignment_status: 'linked' | 'unlinked'
  linked_goal_id?: string
  linked_engine?: string
  start_date?: string
  end_date?: string
  created_by: string
  created_at: string
  updated_at: string
}
```

### Storage Keys
- `year-plan-${year}` - Current year plan
- `year-items-${year}` - Array of year items
- `demo-year-plan` - Demo mode year plan
- `demo-year-items` - Demo mode year items

## Risks + Mitigations

### Risk 1: Drag and Drop Complexity (High)
**Risk**: HTML5 DnD API can be complex and buggy across browsers
**Mitigation**: Use proven patterns from FileUpload component, implement fallback click-to-move, test extensively on Chrome/Firefox/Safari

### Risk 2: Performance with Many Cards (Medium)
**Risk**: 20+ draggable cards might cause performance issues
**Mitigation**: Use React.memo for cards, implement virtual scrolling if needed, limit to hackathon scope (max 20 items)

### Risk 3: Data Alignment Logic (Medium)
**Risk**: Complex alignment rules between North Star, department goals, and year items
**Mitigation**: Start with simple direct linking, use clear visual indicators for unlinked items, provide easy "link to North Star" action

## Technical Architecture

### Component Hierarchy
```
YearBoardPage
├── EmptyState (if no plan)
├── GeneratePlanButton
├── YearBoard
│   ├── QuarterColumn (Q1-Q4)
│   │   ├── DepartmentLane (Company, Ops, Sales, Finance)
│   │   │   └── YearCard[] (draggable)
│   └── CardEditModal
└── ExportSection
```

### Data Flow
1. Page loads → Check localStorage for year plan
2. Empty state → Show generate button
3. Generate → Create plan + items → Save to localStorage
4. Drag card → Update item quarter/department → Autosave
5. Edit card → Show modal → Update item → Save
6. Export → Read localStorage → Generate CSV

## Acceptance Criteria Mapping

- ✅ **Board renders in light and dark mode** → Slice 1
- ✅ **Generate creates correct number of items** → Slice 3 + Unit tests
- ✅ **Drag/drop works and persists** → Slice 2 + E2E tests
- ✅ **Export produces valid CSV** → Slice 5 + Unit tests
- ✅ **Import loads items and flags unlinked** → Slice 5 + Unit tests
- ✅ **Tests run and pass** → Slice 6

This plan delivers a complete Year Board feature that extends DriverOS from weekly/monthly planning to annual strategic planning while maintaining all existing constraints and patterns.
