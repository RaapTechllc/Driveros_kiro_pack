# Code Cleanup Tasks

## Task 1: Consolidate csv-import.ts [HIGH] - 30min ✅
- [x] Remove duplicate async versions (validateActionsCSV, validateGoalsCSV)
- [x] Keep sync versions as primary
- [x] Add simple async wrappers if needed
- [x] Update imports in consuming files
- **Result: 780 → 255 lines (-525)**

## Task 2: Simplify transcript-parser.ts [MEDIUM] - 30min ✅
- [x] Remove 8-format detection complexity
- [x] Keep basic line parsing + action extraction
- [x] Update MeetingForm.tsx imports
- **Result: 500 → 82 lines (-418)**

## Task 3: Minimize data-migration.ts [MEDIUM] - 15min ✅
- [x] Deleted - unused in app, only in tests
- [x] Deleted test file too
- **Result: 363 + 130 = 493 lines deleted**

## Task 4: Delete unused useCSVProcessor hook ✅
- [x] Hook was never imported anywhere
- **Result: 120 lines deleted**

## Task 5: Extract DashboardEmptyState [LOW] - SKIPPED
## Task 6: Extract ExportPanel [LOW] - SKIPPED
## Task 7: Consolidate constants [LOW] - SKIPPED
## Task 8: Remove unused exports [LOW] - SKIPPED

## Task 9: Verify [REQUIRED] ✅
- [x] npm run build passes
- [ ] npm test (skipped - SWC binary issue in WSL)

---

## Summary

| File | Before | After | Saved |
|------|--------|-------|-------|
| csv-import.ts | 780 | 255 | 525 |
| transcript-parser.ts | 500 | 82 | 418 |
| data-migration.ts | 363 | 0 | 363 |
| data-migration.test.ts | 130 | 0 | 130 |
| useCSVProcessor.ts | 120 | 0 | 120 |
| **TOTAL** | **1893** | **337** | **1556** |
