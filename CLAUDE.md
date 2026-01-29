# CLAUDE.md - DriverOS Project Instructions

## Project Overview
DriverOS is an AI-powered business operating system that helps founders diagnose and improve their businesses. It synthesizes multiple business frameworks (Empire OS, EOS/Traction, Hormozi) into a unified diagnostic and action system.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Database**: Supabase (if applicable)
- **Deployment**: Vercel

## Core Concepts

### The 5 Engines
Business health is measured across 5 engines:
1. **Vision** — Clarity, strategy, alignment (EOS Vision Component)
2. **People** — Team, structure, right seats (EOS People, GWC)
3. **Operations** — Systems, processes, execution (EOS Process, Empire Brick)
4. **Revenue** — Marketing, sales, offers (Hormozi Leads/Offers)
5. **Finance** — Cash, metrics, unit economics (EOS Data, scorecards)

### The Gear System (1-5)
Business maturity mapped to driving metaphor:
- **Gear 1 (Idle)**: $0-250K, survival mode, founder does everything
- **Gear 2 (Cruising)**: $250K-1M, stability, basic systems
- **Gear 3 (Accelerating)**: $1M-5M, efficiency, scaling team
- **Gear 4 (Racing)**: $5M-25M, high performance, leadership team
- **Gear 5 (Apex)**: $25M+, self-managing, legacy mode

### Flash Scan
6-question rapid diagnostic that scores each engine (0-20 points per question) and identifies red flags. Total score determines current Gear estimate.

### Actions
Generated recommendations with:
- Priority: `do_now` (urgent/blocking) vs `do_next` (important/sequential)
- Owner: Inferred role (CEO, COO, Sales, Finance, Operations)
- Effort: 1-5 scale (1 = <1hr, 5 = multiple weeks)

## Directory Structure
```
/lib
  /frameworks      # Framework constants and types
    engines.ts     # 5 engines with questions, flags, mistakes
    gears.ts       # 5 gears with criteria and transitions
    flash-scan.ts  # 6 Flash Scan questions with scoring
    actions.ts     # Action templates and generation rules
  /analysis        # Scoring and recommendation logic
    score-calculator.ts
    action-generator.ts
  /types           # Shared TypeScript types
```

## Code Conventions
- Pure functions for scoring/analysis logic
- Zod schemas for all external data
- Export types alongside implementations
- Use discriminated unions for action types
- Scoring functions return deterministic results (no randomness)

## Framework Reference
Primary source: `SECTION_5__MAPPING_FRAMEWORKS_TO_DRIVEROS.docx`
- Section 5.1: Engine mapping table (questions, scoring, flags, mistakes)
- Section 5.2: Gear definitions (revenue ranges, characteristics, traps)
- Section 5.3: Flash Scan questions (scoring logic, red flags, follow-ups)
- Section 5.4: Action generation (prioritization, owner assignment, effort)

## Key Implementation Rules
1. Every diagnostic question maps to exactly one engine
2. Scores are additive: +0, +10, or +20 per question
3. Red flags trigger `do_now` actions automatically
4. Owner assignment uses functional inference (no org chart required)
5. Actions must be specific and actionable (not vague advice)

## Testing Approach
- Unit test scoring functions with known inputs/outputs
- Test edge cases: all zeros, all max scores, mixed
- Validate action generation produces valid owner/effort combinations