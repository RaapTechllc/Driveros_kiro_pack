---
description: Endgame review for hackathon submission (generate judge-ready outputs)
---

# Endgame review: submission readiness

## Mission
Review the repo as a judge would.
Produce clean, copy/paste-ready submission material.
Be strict. Be specific. Short sentences.

## Read first
- `README.md`
- `DEVLOG.md`
- `docs/PRD.md`
- `docs/DEMO.md`
- `docs/INSTALL.md`
- `docs/CONTRACTS.md`
- `docs/ARCHITECTURE.md`
- `docs/TEST_PLAN.md`
- `docs/SEED_DATA.md` (if present)
- `docs/HACKATHON_SUBMISSION.md`
- `docs/JUDGING.md`

## Repo scan
- List key folders and entry points.
- Confirm where the demo starts (URL + route).

## Verify commands (report results)
Run these if they exist. Use `|| true` to keep moving.
```bash
npm run lint || true
npm test || true
npm run build || true
npm run test:e2e || true
```

## Output files (write or update)
Update these docs with your findings:
- `docs/HACKATHON_SUBMISSION.md` (final one-pager)
- `docs/JUDGING.md` (final judge notes)

## Output report (in chat)
Produce a single markdown report with:

1) What this project is (1 paragraph)
2) Install steps (verified, numbered)
3) Demo path (verified, numbered)
4) What is impressive (3 bullets)
5) Submission text (3 lengths)
   - 140 chars
   - 3–4 sentences
   - 1 paragraph
6) 2-minute demo script
7) Judge checklist (pass/fail + gaps)
8) Top risks/bugs (max 5) + fixes
9) “Next after hackathon” (3 bullets)

## Style
- Short sentences.
- No fluff.
- If something is missing, say it.
