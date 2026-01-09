---
description: Execute a DriverOS plan (hackathon loop)
argument-hint: [path-to-plan]
---

# Execute: Implement from plan

## Plan
Read: `$ARGUMENTS`

## Rules
- Follow the plan order.
- Stay inside scope.
- If you must change scope, write it to DEVLOG with the reason.

## Work loop (per slice)
1) Read the target files first.
2) Implement one slice.
3) Run unit tests for that slice.
4) Run Playwright if the flow changed.
5) Update DEVLOG and README.

## Required updates
After each meaningful slice:
- Append a dated entry to `DEVLOG.md` (what changed, why, commands, next).
- Keep `README.md` demo steps accurate.

## Validation (minimum)
Run:
```bash
npm test || true
npm run lint || true
npm run build || true
```

If Playwright exists:
```bash
npm run test:e2e || true
```

## Output report
- files changed
- tests added
- commands run + results
- what is ready to demo
