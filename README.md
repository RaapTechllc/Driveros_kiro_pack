# DriverOS

Turn your North Star into weekly wins with instant business insights.

## Screenshots

![Dashboard](docs/frontend/Screenshot%202026-01-07%20083823.png)
*Complete dashboard with Signal Board, Accelerator, and Action Bay*

![Flash Scan](docs/frontend/Screenshot%202026-01-06%20225154.png)
*Quick 5-minute assessment with instant recommendations*

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start.

### Troubleshooting
- **Port 3000 in use?** Run `npm run dev -- -p 3001`
- **Build fails?** Delete `.next` folder and retry: `rm -rf .next && npm run build`
- **Tests timeout?** Ensure no other dev server is running on port 3000

## Features

### ✅ Flash Scan (Ready)
- 5-minute intake assessment
- Instant accelerator recommendation
- 3-5 quick wins with owners
- Gear estimation (1-5 scale)
- Upgrade path to Full Audit

### ✅ Full Audit (Ready)
- Extended questionnaire (5 engines)
- Complete scoring system (0-100 per engine)
- Risk assessment with brakes
- Action prioritization (do now / do next)
- Gear calculation (1-5: Idle → Apex)

### ✅ Dashboard (Ready)
- Unified view for Flash Scan and Full Audit
- Signal Board (5 engines with status)
- Weekly Accelerator display
- Action Bay with prioritized tasks
- CSV export (actions & goals)

### ✅ E2E Testing (Ready)
- Playwright test infrastructure
- Complete user journey testing
- Page object models for maintainability
- Automated CSV export verification

### ✅ Meeting Templates (Ready)
- Warm-Up (10min daily), Pit Stop (30min weekly), Full Tune-Up (75min monthly)
- Dynamic meeting forms with smart action generation
- Dashboard integration and data persistence
- Complete test coverage

### ✅ CSV Import/Export (Ready)
- Actions and goals CSV import with comprehensive validation
- Template downloads with examples and field descriptions
- Complete data portability with error handling
- Integration with dashboard and existing data

### ✅ Year Board (Ready)
- Jesse Itzler-style year-at-a-glance planning
- AI-first plan generation (6 plays, 4 rituals, 3-6 milestones, 4 tune-ups)
- Drag-and-drop board with Q1-Q4 columns and department swimlanes
- Complete alignment system ensuring all items link to North Star
- CSV export with validation and autosave persistence

### 🎉 All Core Features Complete
Flash Scan → Full Audit → Dashboard → CSV Import/Export → Meeting Templates

## Demo Path

**Judge Experience (2 minutes):**
1. **Landing** - Visit localhost:3000, click "Judge Demo" button
2. **Instant Dashboard** - Complete TechFlow Solutions analysis loads immediately
3. **Guided Tour** - 5-step overlay highlights: Gear → Accelerator → Signal Board → Action Bay → CSV Export
4. **Feature Exploration** - All features work with realistic sample data
5. **Exit Demo** - Clear demo mode indicators and easy exit

**Manual Experience (7 minutes):**
1. **Landing** - Visit localhost:3000
2. **Flash Scan** - Click "Start Flash Scan"
3. **Form** - Fill 5 fields (industry, size, role, north star, constraint)
4. **Results** - Get instant analysis with accelerator and quick wins
5. **Upgrade** - Click "Upgrade to Full Audit"
6. **Full Audit** - Complete 15-field questionnaire across 5 engines
7. **Analysis** - See detailed engine scoring and risk assessment
8. **Dashboard** - View complete Signal Board and Action Bay
9. **Export** - Download actions and goals CSV

**Total demo time**: Judge mode: 2min, Manual: 7min

## Testing

```bash
npm test        # Unit tests (11/11 passing)
npm run build   # Production build
npm run dev     # Development server
```

## Architecture

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with light/dark theme
- **State**: React state + localStorage
- **Analysis**: Client-side rules engine
- **Testing**: Jest + Testing Library

## Project Structure

```
app/                    # Next.js pages
├── page.tsx           # Landing page
├── flash-scan/        # Flash Scan flow
└── layout.tsx         # Root layout

components/            # React components
├── flash-scan/        # Flash Scan specific
└── ui/               # Reusable UI components

lib/                   # Business logic
├── flash-analysis.ts  # Analysis engine
├── types.ts          # TypeScript interfaces
└── utils.ts          # Utilities

__tests__/            # Test files
```

## Hackathon Scope

Following `.kiro/steering/scope.md` constraints:
- ✅ No external integrations
- ✅ Max 3 departments
- ✅ Weekly accelerator cadence
- ✅ One sentence rationales
- ✅ Light/dark mode support
- ✅ Under 5 minute Flash Scan

## Kiro CLI Workflow

This project uses Kiro's local prompt system for AI-assisted development:

| Prompt | Purpose |
|--------|---------|
| `@prime` | Load project context and memory at session start |
| `@memory` | Persist session state across conversations |
| `@code-review` | Automated hackathon compliance checks |
| `@devlog-update` | Keep DEVLOG current after each slice |
| `@planner-system` | Auto-select and plan next features |

**Steering docs** in `.kiro/steering/` define constraints:
- `scope.md` - Hackathon boundaries
- `domain-model.md` - Data contracts
- `scoring.md` - Engine calculation rules

## Next Development

See `DEVLOG.md` for implementation progress and next steps.
