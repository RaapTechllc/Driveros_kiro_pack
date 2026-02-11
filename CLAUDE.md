# CLAUDE.md - DriverOS Project Instructions

## Project Overview

DriverOS is an AI-powered business operating system that helps founders diagnose and improve their businesses. It synthesizes multiple business frameworks (Empire OS, EOS/Traction, Hormozi) into a unified diagnostic and action system.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript 5+ (strict mode) |
| Runtime | Node.js 20+ |
| Styling | Tailwind CSS 3.3 + shadcn/ui (Radix UI primitives) |
| Animations | Framer Motion, tailwindcss-animate |
| Validation | Zod 4 |
| Auth & DB | Supabase (SSR + supabase-js) |
| Testing | Jest 29 (unit) + Playwright (E2E) |
| CI/CD | GitHub Actions |
| Deployment | Docker (PostgreSQL 15 + Redis 7 + app) or Vercel |

## Quick Reference - Commands

```bash
npm run dev          # Start dev server on port 4005
npm run build        # Production build
npm test             # Run unit tests (Jest)
npm run test:e2e     # Run E2E tests (Playwright, headless)
npm run test:e2e:headed  # E2E with visible browser
npm run demo         # Reset demo data + start dev server
npm run seed         # Seed demo data
npm run reset        # Reset demo data
npx tsc --noEmit     # TypeScript type check (used in CI)
```

## Directory Structure

```
/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (providers, theme, auth)
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles + CSS variables
│   ├── dashboard/          # Main dashboard
│   ├── flash-scan/         # 5-min rapid diagnostic
│   ├── full-audit/         # Extended 15-field assessment
│   ├── apex-audit/         # Advanced audit functionality
│   ├── check-in/           # Daily check-in feature
│   ├── pit-stop/           # Weekly meeting template
│   ├── meetings/           # Meeting templates & history
│   ├── year-board/         # Annual planning view
│   ├── onboarding/         # User onboarding flow
│   ├── settings/           # User settings
│   ├── admin/              # Admin features
│   ├── import/             # CSV import page
│   ├── parked-ideas/       # Idea parking lot
│   ├── performance/        # System health dashboard
│   ├── pricing/            # Pricing page
│   ├── help/               # Help/documentation page
│   ├── login/              # Authentication
│   ├── signup/             # Registration
│   ├── forgot-password/    # Auth recovery
│   └── reset-password/     # Password reset
│
├── components/             # React components by feature
│   ├── ui/                 # Reusable UI primitives (Button, Card, etc.)
│   ├── layout/             # Header, Sidebar, AppLayout
│   ├── providers/          # React context providers
│   ├── auth/               # Auth-specific components
│   ├── dashboard/          # Dashboard widgets
│   ├── flash-scan/         # Flash Scan form/results
│   ├── full-audit/         # Full Audit form components
│   ├── apex-audit/         # Apex Audit components
│   ├── landing/            # Landing page sections
│   ├── meetings/           # Meeting template components
│   ├── year-board/         # Year Board planning
│   ├── import/             # CSV import/export UI
│   ├── demo/               # Demo mode components
│   ├── ErrorBoundary.tsx   # App-level error boundary
│   └── PageErrorBoundary.tsx
│
├── lib/                    # Business logic & utilities
│   ├── frameworks/         # Framework definitions
│   │   ├── engines.ts      # 5 engine definitions (questions, flags, mistakes)
│   │   ├── gears.ts        # 5 gear definitions (revenue, traits, traps)
│   │   ├── flash-questions.ts  # Flash Scan questions + scoring
│   │   └── action-templates.ts # Action recommendation templates
│   ├── analysis/           # Scoring & recommendation engines
│   │   ├── score-calculator.ts   # Engine scoring (pure functions)
│   │   ├── gear-calculator.ts    # Gear estimation
│   │   ├── action-generator.ts   # Action recommendations
│   │   ├── framework-analysis.ts # Framework-based analysis
│   │   └── weekly-plan.ts        # Weekly planning logic
│   ├── supabase/           # Supabase integration
│   │   ├── client.ts       # Client-side Supabase instance
│   │   ├── server.ts       # Server-side with service role
│   │   ├── auth.ts         # Auth utilities
│   │   ├── middleware.ts    # Session management
│   │   └── types.ts        # Database type definitions
│   ├── data/               # Data layer (localStorage + demo)
│   │   ├── actions.ts
│   │   ├── assessments.ts
│   │   ├── check-ins.ts
│   │   ├── meetings.ts
│   │   ├── north-star.ts
│   │   ├── parked-ideas.ts
│   │   └── year-plan.ts
│   ├── pit-stop/           # Pit Stop meeting logic
│   ├── hooks/              # Library-level hooks
│   ├── types.ts            # Core TypeScript types
│   ├── constants.ts        # App-wide constants (no magic numbers)
│   ├── validation.ts       # Zod schemas for external data
│   ├── sanitize.ts         # Input sanitization (XSS, CSV injection)
│   ├── utils.ts            # General utilities (cn, formatters)
│   ├── storage.ts          # localStorage wrapper
│   ├── logger.ts           # Structured logging
│   ├── performance-monitor.ts  # Performance tracking
│   ├── flash-analysis.ts   # Flash Scan analysis engine
│   ├── full-audit-analysis.ts  # Full Audit analysis engine
│   ├── apex-audit-analysis.ts  # Apex Audit analysis engine
│   ├── csv-export.ts       # CSV export functionality
│   ├── csv-import.ts       # CSV import with validation
│   ├── demo-data.ts        # Sample data (TechFlow Solutions)
│   ├── demo-mode.ts        # Demo mode logic
│   ├── data-migration.ts   # Data schema migration
│   ├── engine-history.ts   # Engine score history tracking
│   ├── goal-progress.ts    # Goal tracking
│   ├── guardrails.ts       # Business rule validation
│   ├── industry-knowledge.ts   # Industry-specific insights
│   ├── meeting-templates.ts    # Meeting template definitions
│   ├── transcript-parser.ts    # Meeting transcript parsing
│   ├── team-roster.ts      # Team member management
│   ├── year-board-*.ts     # Year Board (types, storage, generator, CSV)
│   └── action-status.ts    # Action status management
│
├── hooks/                  # Custom React hooks
│   ├── useDashboardData.ts
│   ├── useDataMigration.ts
│   ├── useFormSubmit.ts
│   └── useRequireAuth.ts
│
├── __tests__/              # Jest unit tests (mirrors lib/)
│   ├── flash-analysis.test.ts
│   ├── full-audit-analysis.test.ts
│   ├── apex-audit-analysis.test.ts
│   ├── csv-import.test.ts
│   ├── csv-export.test.ts
│   ├── demo-data.test.ts
│   ├── demo-mode.test.ts
│   ├── data-migration.test.ts
│   ├── engine-history.test.ts
│   ├── goal-progress.test.ts
│   ├── parked-ideas.test.ts
│   ├── performance-monitor.test.ts
│   ├── industry-knowledge.test.ts
│   ├── meeting-templates.test.ts
│   ├── year-board-generator.test.ts
│   ├── animations.test.tsx
│   ├── year-board-animations.test.tsx
│   └── lib/               # Nested tests for lib submodules
│
├── tests/                  # Playwright E2E tests
├── scripts/                # Utility scripts (seed, reset, screenshots)
├── public/                 # Static assets
├── docs/                   # Project documentation
├── .kiro/                  # Kiro CLI steering docs & specs
├── .github/workflows/ci.yml  # CI/CD pipeline
├── middleware.ts           # Next.js auth middleware
├── Dockerfile              # Multi-stage production build
└── docker-compose.yml      # PostgreSQL + Redis + app
```

## Core Domain Concepts

### The 5 Engines

Business health is measured across 5 engines. Every diagnostic question maps to exactly one engine:

1. **Vision** — Clarity, strategy, alignment (EOS Vision Component)
2. **People** — Team, structure, right seats (EOS People, GWC)
3. **Operations** — Systems, processes, execution (EOS Process, Empire Brick)
4. **Revenue** — Marketing, sales, offers (Hormozi Leads/Offers)
5. **Finance** — Cash, metrics, unit economics (EOS Data, scorecards)

**Type**: `'vision' | 'people' | 'operations' | 'revenue' | 'finance'`

### The Gear System (1-5)

Business maturity mapped to a driving metaphor:

| Gear | Name | Revenue | Characteristics |
|------|------|---------|-----------------|
| 1 | Idle | $0-250K | Survival mode, founder does everything |
| 2 | Cruising | $250K-1M | Stability, basic systems |
| 3 | Accelerating | $1M-5M | Efficiency, scaling team |
| 4 | Racing | $5M-25M | High performance, leadership team |
| 5 | Apex | $25M+ | Self-managing, legacy mode |

**Type**: `1 | 2 | 3 | 4 | 5`

### Flash Scan

6-question rapid diagnostic. Scoring: +0, +10, or +20 per question. Total score estimates current Gear. Produces confidence score (0.65-0.92), weekly accelerator KPI, and 3-5 quick wins.

### Full Audit

15-field extended assessment across all 5 engines. 1-5 scoring per field, normalized to 0-100 per engine and 0-100 overall.

### Actions

Generated recommendations with:
- **Priority**: `do_now` (urgent/blocking) vs `do_next` (important/sequential)
- **Owner**: Inferred role — `'CEO' | 'COO' | 'Sales' | 'Finance' | 'Operations' | 'HR'`
- **Effort**: 1-5 scale (1 = <1hr, 5 = multiple weeks)
- Red flags trigger `do_now` actions automatically

## Code Conventions

### TypeScript

- **Strict mode** is enabled — do not weaken or bypass `tsconfig.json` strictness
- Use `@/*` path alias for imports (maps to project root)
- Export types alongside implementations in the same file
- Use discriminated unions for action/status types
- Use `type` for type aliases and `interface` for object shapes that may be extended

### Pure Functions for Business Logic

All scoring and analysis functions in `lib/analysis/` and `lib/*-analysis.ts` must be:
- **Pure** — no side effects, no external state
- **Deterministic** — same inputs always produce same outputs (no randomness)
- **Typed** — explicit input/output types

### Validation

- Zod schemas for all external data (user input, CSV imports, API responses)
- Input sanitization includes HTML tag stripping and CSV injection prevention
- Length limits enforced (200-500 chars depending on field)

### Styling

- Tailwind CSS utility classes — no custom CSS except in `globals.css`
- Dark mode via `class` strategy (toggled by `next-themes`)
- Colors use HSL CSS variables (defined in `globals.css`, referenced in `tailwind.config.js`)
- UI components built on Radix UI via shadcn/ui (`components/ui/`)
- Use `cn()` helper from `lib/utils.ts` for conditional class merging

### Component Patterns

- Pages use `'use client'` directive (Client Components)
- Provider hierarchy in `app/layout.tsx`: Theme → Auth → Org → Migration
- Feature components organized by domain in `components/<feature>/`
- Reusable primitives in `components/ui/`

### Data Flow

```
User Input → Zod Validation → Analysis Function (pure) → Result Object
  → localStorage or Supabase → React State → Dashboard/Reports
```

### Constants

All magic numbers and thresholds live in `lib/constants.ts`. Do not inline numeric constants in business logic.

## Key Implementation Rules

1. Every diagnostic question maps to exactly one engine
2. Scores are additive: +0, +10, or +20 per question
3. Red flags trigger `do_now` actions automatically
4. Owner assignment uses functional inference (no org chart required)
5. Actions must be specific and actionable (not vague advice)
6. Never commit secrets — `.env.local` is gitignored, use `.env.example` as template

## Environment Variables

Copy `.env.example` to `.env.local` for local development. Key variables:

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | For auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | For auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server key (never expose client-side) | For server ops |
| `NEXT_PUBLIC_DEMO_MODE` | `true` bypasses auth, uses localStorage | For demo |
| `NEXT_PUBLIC_STRIPE_*` | Stripe keys for pricing | For payments |
| `NEXT_PUBLIC_APP_URL` | Public URL (default `http://localhost:4005`) | For callbacks |

**Demo mode**: Set `NEXT_PUBLIC_DEMO_MODE=true` to bypass authentication entirely and use localStorage for all data. This is the default when Supabase is not configured.

## Auth & Middleware

- `middleware.ts` at project root handles auth routing
- Protected routes redirect unauthenticated users to `/login?returnTo=<path>`
- Authenticated users on `/login` or `/signup` redirect to `/dashboard`
- Static assets (`/_next`, `/api`, file extensions) skip middleware
- Demo mode and missing Supabase config both bypass auth entirely

## Testing

### Unit Tests (Jest)

- Tests live in `__tests__/` mirroring `lib/` structure
- Run: `npm test` (or `npm test -- --coverage` for coverage report)
- Config: `jest.config.js` uses `next/jest` with jsdom environment
- E2E tests in `tests/e2e/` are excluded from Jest
- Current status: 212+ tests passing, 22+ suites, ~92% coverage

**Test conventions**:
- Test scoring functions with known inputs/outputs
- Test edge cases: all zeros, all max scores, mixed values
- Validate action generation produces valid owner/effort combinations
- Use descriptive test names that explain the expected behavior

### E2E Tests (Playwright)

- Tests live in `tests/` directory
- Run: `npm run test:e2e` (headless) or `npm run test:e2e:headed` (visible browser)
- Config: `playwright.config.ts`
- Targets Chromium
- Requires a production build first (`npm run build`)

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push to `main`/`master` and PRs:

| Job | Depends On | What It Does |
|-----|-----------|--------------|
| Lint & Type Check | — | `npm ci` + `npx tsc --noEmit` |
| Unit Tests | — | `npm test --coverage`, uploads coverage artifact |
| E2E Tests | — | Installs Playwright, builds app, runs E2E |
| Production Build | Lint + Unit | `npm run build`, uploads `.next/` artifact |

All jobs use Node.js 20 on `ubuntu-latest`. Artifacts retained for 7 days.

**Before pushing**: Ensure `npx tsc --noEmit` and `npm test` both pass.

## Docker Deployment

```bash
docker-compose up -d        # Start PostgreSQL + Redis + app
docker-compose up --build -d  # Rebuild and start
docker-compose down          # Stop all services
```

Services:
- **PostgreSQL 15**: port 5432, database `driveros`
- **Redis 7**: port 6379 (sessions/caching)
- **App**: port 4005, depends on healthy postgres + redis

## Security

The application enforces multiple security layers:

- **HTTP headers** (in `next.config.js`): X-Frame-Options DENY, HSTS, nosniff, XSS protection, CSP, Permissions-Policy, Referrer-Policy
- **CSP**: Stricter in production (no `unsafe-eval`)
- **Input validation**: Zod schemas with XSS prevention (HTML stripping, entity encoding)
- **CSV injection prevention**: Formula character prefixing on import
- **Auth**: Supabase session cookies with Edge middleware enforcement
- **No `X-Powered-By` header** exposed

## Framework Reference

Primary source: `SECTION_5__MAPPING_FRAMEWORKS_TO_DRIVEROS.docx`
- Section 5.1: Engine mapping table (questions, scoring, flags, mistakes)
- Section 5.2: Gear definitions (revenue ranges, characteristics, traps)
- Section 5.3: Flash Scan questions (scoring logic, red flags, follow-ups)
- Section 5.4: Action generation (prioritization, owner assignment, effort)

Additional steering docs in `.kiro/steering/` cover domain model, scoring rules, scope, security, UI, and tone.
