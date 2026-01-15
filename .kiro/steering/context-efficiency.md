# Context Efficiency Standards

Guidelines for maintaining lean, high-density code.

## Size Limits

| Metric | Target | Max | Action if exceeded |
|--------|--------|-----|-------------------|
| Function LOC | 25 | 50 | Split or simplify |
| File LOC | 200 | 300 | Extract module |
| Component props | 5 | 8 | Create compound component |
| Import count | 10 | 15 | Review dependencies |

## Context Density Targets

| File Type | Target Score | Notes |
|-----------|--------------|-------|
| lib/*.ts (business logic) | 8-10 | Core value, must be tight |
| components/*.tsx | 7-9 | UI should be declarative |
| __tests__/*.ts | 6-8 | Tests can be verbose for clarity |
| types.ts | 9-10 | Types are documentation |

## Deletion Review Process

Before any PR:
1. Run `@strands-review` on changed files
2. Address all DELETE items
3. Evaluate CONSOLIDATE suggestions
4. Document KEEP decisions if questioned

## Red Flags (auto-review triggers)

- File > 300 LOC
- Function > 50 LOC
- More than 3 levels of nesting
- Commented-out code
- TODO older than 7 days
- Unused exports

## The Deletion Hierarchy

Apply in order - never skip steps:

1. **Question** - Should this exist at all?
2. **Delete** - Remove what's unnecessary
3. **Simplify** - Reduce what remains
4. **Accelerate** - Optimize the essential
5. **Automate** - Only after manual process proven

## Metrics to Track

- Total LOC (lower is better, given same functionality)
- Files changed per feature (fewer is better)
- Import graph depth (shallower is better)
- Test-to-code ratio (aim for 1:3)

**"The best code is no code."**
