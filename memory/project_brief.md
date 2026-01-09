# DriverOS - Project Brief

## Mission
> Turn your North Star into weekly wins with instant business insights.

DriverOS is a multi-tenant web application that provides business analysis through two onboarding modes (Flash Scan and Full Audit), delivering actionable recommendations and structured meeting templates to maintain business momentum.

## Problem Statement
Business owners struggle with:
- Unclear business health assessment
- Lack of structured goal alignment
- Meeting fatigue without actionable outcomes
- Disconnected metrics and actions
- No systematic approach to business rhythm

DriverOS solves this by providing instant business analysis, clear action prioritization, and structured meeting templates that drive results.

## Tech Stack
| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | Next.js 14 + React 18 | App Router, TypeScript |
| Styling | Tailwind CSS | Light/dark theme support |
| State | React state + localStorage | Client-side persistence |
| Analysis | Client-side rules engine | No external APIs |
| Testing | Jest + Testing Library + Playwright | Unit + E2E coverage |
| Hosting | Static deployment ready | No server dependencies |

## Product Phases
- **Phase 1:** Flash Scan + Full Audit - ✅ Complete
- **Phase 2:** Dashboard + CSV Export - ✅ Complete  
- **Phase 3:** Meeting Templates + CSV Import - ✅ Complete

## Non-Negotiables
Things that must always be true, no matter what:
1. **No external integrations** - Must work completely offline/standalone
2. **Under 5 minutes for Flash Scan** - Speed is critical for adoption
3. **Max 3 departments** - Scope constraint for hackathon MVP
4. **Weekly Accelerator cadence only** - No daily/monthly variants
5. **One sentence rationales** - Concise, actionable feedback
6. **CSV-only data portability** - No complex integrations

## Success Metrics
How do we know when we've succeeded?
- [x] **Flash Scan completes in under 5 minutes** - Achieved
- [x] **Full Audit generates 5-engine analysis** - Achieved  
- [x] **Dashboard shows unified view** - Achieved
- [x] **CSV import/export works end-to-end** - Achieved
- [x] **Meeting templates generate actions** - Achieved
- [x] **All tests pass (unit + E2E)** - Achieved
- [x] **Production build successful** - Achieved

## Out of Scope (v1)
What we're explicitly NOT building right now:
- External integrations (QuickBooks, HubSpot, Slack)
- Payment processing
- Complex RBAC/permissions
- Multi-step wizards beyond Flash/Audit
- Heavy charts or animations
- More than 3 departments
- Non-weekly Accelerator cadences
