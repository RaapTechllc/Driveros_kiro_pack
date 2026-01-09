---
description: DriverOS hackathon quickstart
---

# Quickstart: DriverOS (hackathon)

## Goal
Get to a judge-ready demo fast.
Keep scope tight.

## First checks
Run:
```bash
ls -la
ls -la .kiro || true
ls -la docs || true
```

Confirm you have:
- `.kiro/steering/` (this pack)
- `.kiro/prompts/` (this pack)
- `docs/` with your PRD + questionnaire (if you have them)

## Recommended build loop
1) `@prime`
2) `@plan-feature` (one feature at a time)
3) `@execute <plan-path>`
4) `@code-review`
5) `@devlog-update`
6) `@readme-sync`

## Hackathon priorities
- Flash Scan -> instant quick wins.
- Upgrade -> Full Audit -> dashboard.
- CSV import/export works.

## Hard bans
- No external integrations.
- No payments.
- No complex auth.

## Next question to ask the user (only if needed)
- “Where is the PRD file in this repo?”
- “Where is the questionnaire file in this repo?”
