# Scope fence (hackathon)

## Must ship
- Flash Scan onboarding (under 5 minutes).
- Full Audit onboarding (upgrade path).
- Dashboard:
  - North Star
  - Weekly Accelerator
  - Signal Board (5 engines)
  - Brakes (risk flags)
  - Action Bay (do now / do next)
- Meetings templates:
  - Warm-Up (daily)
  - Pit Stop (weekly)
  - Full Tune-Up (monthly/quarterly)
- CSV:
  - export actions
  - export goals
  - import actions
  - import goals

## Must not ship
- No external integrations (no QuickBooks, HubSpot, Slack).
- No payments.
- No complex RBAC.
- No multi-step wizards beyond the two onboarding paths.
- No heavy charts or animations that risk bugs.

## Limits
- Max 3 departments.
- Weekly cadence for Accelerator.
- One sentence rationale everywhere.

## Demo path (judge-friendly)
- Seed a sample company.
- Show Flash Scan -> instant quick wins.
- Show upgrade -> Full Audit -> dashboard.
- Export goals/actions CSV and open them in Excel.

## Kiro usage expectation
- Use local prompts in .kiro/prompts.
- Keep DEVLOG and README updated after each slice.
- Add tests before calling a feature “done”.
