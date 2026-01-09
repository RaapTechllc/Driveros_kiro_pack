# Feature Plan: Dashboard Enhancement - Imported Actions/Goals Display

## Feature Description
Integrate imported CSV actions and goals into the main dashboard Action Bay and Goals sections, allowing users to see their imported data alongside generated analysis results in a unified view with proper status tracking and visual distinction.

## User Story
As a business owner who has imported existing actions and goals via CSV,  
I want to see my imported data displayed in the dashboard alongside generated recommendations so I can manage all my business activities in one place.

## Files to Read First
- `app/dashboard/page.tsx` - Current dashboard implementation
- `app/import/page.tsx` - How imported data is stored in localStorage
- `lib/types.ts` - Action and Goal interfaces
- `components/dashboard/ActionBay.tsx` - Current action display logic
- `lib/demo-data.ts` - Example data structure

## Files to Create/Modify
- `lib/imported-data.ts` - New utility for loading imported data
- `app/dashboard/page.tsx` - Modify to load and merge imported data
- `components/dashboard/ActionBay.tsx` - Update to display imported actions with visual distinction
- `components/dashboard/GoalsSection.tsx` - Update to display imported goals
- `components/ui/Badge.tsx` - Add "Imported" badge component
- `__tests__/imported-data.test.ts` - Unit tests for data loading

## Step-by-Step Tasks

1. **Create imported data utilities**
   - Add `loadImportedActions()` and `loadImportedGoals()` functions
   - Handle localStorage parsing with error handling
   - Transform imported data to match dashboard interfaces

2. **Update dashboard data loading**
   - Modify dashboard page to load imported data on mount
   - Merge imported actions with generated actions in Action Bay
   - Merge imported goals with analysis goals in Goals section

3. **Add visual distinction**
   - Create "Imported" badge component with distinct styling
   - Add badge to imported actions and goals in dashboard
   - Ensure imported items are clearly distinguishable from generated ones

4. **Update Action Bay display**
   - Modify ActionBay to accept mixed action sources
   - Group actions by source (generated vs imported) or mix them
   - Maintain existing "do now" / "do next" categorization

5. **Update Goals display**
   - Show imported goals alongside North Star and department goals
   - Maintain goal hierarchy and alignment statements
   - Handle cases where imported goals conflict with generated ones

6. **Add empty state handling**
   - Show appropriate messages when no imported data exists
   - Gracefully handle localStorage errors or corruption

## Validation Commands
```bash
npm test -- imported-data.test.ts
npm run dev
# Navigate to /import, import sample CSV, then check /dashboard
npm run build
```

## Test Cases

### Unit Tests
- `loadImportedActions()` returns empty array when no data
- `loadImportedActions()` parses valid localStorage data correctly
- `loadImportedGoals()` handles corrupted localStorage gracefully
- Imported data transformation matches dashboard interfaces

### E2E Tests
- Import actions CSV → Dashboard shows imported actions with badges
- Import goals CSV → Dashboard displays imported goals in hierarchy
- Import both → Dashboard shows unified view without conflicts
- Clear localStorage → Dashboard shows only generated data

## Demo Steps (Judge Experience)

1. **Setup**: Start with clean dashboard showing generated analysis
2. **Import Actions**: Navigate to /import, upload sample actions CSV
3. **View Integration**: Return to dashboard, see imported actions in Action Bay with "Imported" badges
4. **Import Goals**: Upload sample goals CSV via import page
5. **Unified View**: Dashboard now shows complete picture - generated analysis + imported data
6. **Visual Distinction**: Point out badges and grouping that distinguish data sources
7. **Export Verification**: Export CSV includes both generated and imported items

## Acceptance Test
User can import CSV data and immediately see it integrated into the dashboard alongside generated recommendations, with clear visual distinction between imported and generated items, maintaining all existing dashboard functionality.
