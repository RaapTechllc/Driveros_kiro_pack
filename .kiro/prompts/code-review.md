---
description: DriverOS code review (pre-commit)
---

Review recently changed files.
Focus on bugs, scope drift, and demo risk.

## Read first
- `.kiro/steering/scope.md`
- `.kiro/steering/domain-model.md`
- `.kiro/steering/scoring.md`

## Gather changes
```bash
git status || true
git diff --stat HEAD || true
git diff HEAD || true
git ls-files --others --exclude-standard || true
```

## Check for these issues

### 1) Scope drift (critical)
- external integrations added
- departments > 3
- cadence not weekly
- multi-step onboarding creep

### 2) Data contract breaks (high)
- analysis payload missing schema_version
- enums inconsistent with domain-model.md
- rationale longer than one sentence

### 3) Logic bugs (high)
- completion threshold logic wrong
- scoring normalization wrong
- CSV import/export headers mismatch

### 4) UI demo risk (medium)
- missing empty states
- theme toggle broken
- dashboard depends on non-seeded data

### 5) Quality (medium/low)
- unclear naming
- missing tests for new logic
- dead code

## Output
Write a report to:
`.agents/code-reviews/driveros-review-<date>.md`

Use this format:

severity: critical|high|medium|low  
file: path  
line: N  
issue: one line  
detail: short explanation  
suggestion: fix
