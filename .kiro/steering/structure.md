# DriverOS - Project Structure

## Directory Layout
```
driveros/
├── app/                     # Next.js App Router pages
│   ├── dashboard/          # Main dashboard with Signal Board
│   ├── flash-scan/         # Quick 5-minute assessment
│   ├── full-audit/         # Comprehensive 5-engine audit
│   ├── year-board/         # Annual planning board
│   ├── meetings/           # Meeting templates and history
│   ├── import/             # CSV import functionality
│   ├── performance/        # System health monitoring
│   ├── settings/           # User preferences
│   ├── help/               # Documentation and guides
│   └── globals.css         # Global styles
├── components/             # Reusable UI components
│   ├── ui/                # Base UI (Button, Input, Card, etc.)
│   ├── dashboard/         # Dashboard-specific components
│   ├── flash-scan/        # Flash Scan form and results
│   ├── full-audit/        # Full Audit form and results
│   ├── year-board/        # Year planning components
│   ├── meetings/          # Meeting form and templates
│   ├── import/            # CSV import components
│   ├── layout/            # Header, Sidebar, AppLayout
│   ├── demo/              # Demo mode components
│   └── landing/           # Landing page components
├── lib/                    # Business logic
│   ├── flash-analysis.ts  # Flash Scan scoring engine
│   ├── full-audit-analysis.ts # Full Audit scoring engine
│   ├── year-board-*.ts    # Year Board utilities
│   ├── meeting-templates.ts # Meeting logic
│   ├── csv-*.ts           # CSV import/export
│   └── types.ts           # TypeScript interfaces
├── hooks/                  # Custom React hooks
├── __tests__/             # Jest unit tests
├── tests/e2e/             # Playwright E2E tests
├── docs/                   # Documentation
└── .kiro/                  # AI-assisted development
    ├── steering/          # Project context
    ├── prompts/           # Custom commands
    └── specs/             # Feature specifications
```

## File Naming Conventions
- **Components**: PascalCase (`SignalBoard.tsx`)
- **Pages**: kebab-case directories (`flash-scan/page.tsx`)
- **Utilities**: camelCase (`flashAnalysis.ts`)
- **Types**: PascalCase in `types.ts`
- **Tests**: `.test.ts` or `.spec.ts` suffix

## Module Organization
- **Feature-based**: Group related components, hooks, and utilities
- **Barrel exports**: Use `index.ts` files for clean imports
- **Separation of concerns**: UI, business logic, and data layers distinct

## Key Routes
| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/flash-scan` | 5-minute quick assessment |
| `/full-audit` | Comprehensive 5-engine audit |
| `/dashboard` | Main dashboard with Signal Board |
| `/year-board` | Annual planning board |
| `/meetings` | Meeting templates |
| `/import` | CSV import |

## Configuration Files
- **Environment**: `.env.local` for local development
- **Testing**: `playwright.config.ts`, `jest.config.js`
- **Kiro**: `.kiro/` directory for AI-assisted development
