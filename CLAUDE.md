# DriverOS Project Context

## What This Is
AI-powered business dashboard for hackathon. Flash Scan → Full Audit → Dashboard → Year Board.

## Tech Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Client-side analysis engine (no backend DB)
- localStorage for persistence
- Jest + Playwright for testing

## Key Commands
```bash
npm run dev          # Start dev server (port 3060)
npm run build        # Production build
npm test             # Unit tests
npm run test:e2e     # E2E tests
```

## Critical Files
- `.kiro/steering/` - Project context and constraints
- `PLAN.md` - Current task checklist
- `PROGRESS.md` - Real-time status
- `LEARNINGS.md` - Captured corrections

## Completion Protocol
Agents MUST output when done:
```
<promise>DONE</promise>
```

## Validation Gates
Before claiming DONE:
```bash
npm run build        # Must pass
npm test             # Must pass
```

## Constraints (Hackathon Scope)
- No external integrations
- Max 3 departments
- CSV import/export only
- Weekly accelerator cadence
- One sentence rationales

## DriverOS Domain
- **Gear** = business phase (1-5: Idle → Apex)
- **Engines** = 5 health pillars (Leadership, Operations, Marketing & Sales, Finance, Personnel)
- **Accelerator** = weekly KPI (The Brick)
- **Brakes** = risks and constraints

## Self-Improvement
When corrected, capture the learning:
```bash
# Add to LEARNINGS.md
echo "- [$(date +%Y-%m-%d)] CORRECTION: description" >> LEARNINGS.md
```

At session end, use `@self-reflect` to analyze patterns.
