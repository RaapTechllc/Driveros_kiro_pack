# Code Cleanup Sprint

## Goal
Reduce codebase by ~1200 lines following "the best code is no code" principle.

## Requirements
1. Eliminate duplicate CSV validation (sync/async versions doing same thing)
2. Simplify transcript parser to basic functionality
3. Remove or minimize data-migration system
4. Extract dashboard inline components
5. Consolidate validation constants to types.ts
6. Remove unused exports

## Constraints
- All existing tests must pass
- No feature regressions
- Build must succeed

## Success Metrics
- ~1200 lines removed
- `npm run build` passes
- `npm test` passes (where environment allows)
