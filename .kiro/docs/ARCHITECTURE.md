# Architecture (Hackathon)

## Stack (default)
- Next.js (App Router)
- Tailwind + shadcn/ui
- Local storage for hackathon (SQLite/Supabase optional later)

## High-level flow
1) User completes Flash Scan.
2) Server builds analysis JSON (AI-first recommendations).
3) UI renders dashboard from the contract.
4) Meetings generate actions.
5) CSV export/import manages portability.

## Components
- Onboarding wizard (Flash Scan, then Full Audit)
- Scoring + recommendation module
- Dashboard renderer (contract-driven)
- Meeting templates engine
- CSV service

## Data flow (simple)
```text
UI Form -> POST /api/scan
        -> (rules + AI recommendation)
        -> analysis JSON
        -> Dashboard UI

Dashboard -> Export CSV -> file download
CSV -> Import -> validate -> actions/goals update
```

## Key boundaries
- No external API calls to accounting/CRM tools.
- No PII required for demo.
- Keep server logic deterministic where possible.
  - Use golden test cases.
  - AI output must be shaped into the contract.

## Theme
- Support light and dark via tokens.
- All charts/gauges must have accessible contrast in both modes.
