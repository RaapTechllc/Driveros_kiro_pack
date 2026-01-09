---
description: Fix issues from DriverOS code review
argument-hint: [path-to-review-report]
---

# Fix: Code review issues

## Review report
Read: `$ARGUMENTS`

## Mission
Fix all critical and high priority issues from the code review.
Focus on demo readiness and data contract compliance.

## Rules
- Fix critical issues first (data contract violations)
- Then high priority (logic bugs, scope compliance)
- Medium priority if time allows
- Update tests for any logic changes
- Maintain existing functionality

## Work approach
1) Read the review report completely
2) Fix issues in order of severity (critical → high → medium)
3) Run tests after each fix to ensure no regressions
4) Update documentation if interfaces change

## Required validation
After each fix:
```bash
npm test || true
npm run build || true
```

## Output format
For each issue fixed:
- Issue: [brief description]
- File: [path]
- Fix: [what was changed]
- Status: ✅ Fixed | ⚠️ Partial | ❌ Skipped

## Auto-trigger next step
After completing fixes, automatically run devlog update:
```
Use prompt: devlog-update.md
```
