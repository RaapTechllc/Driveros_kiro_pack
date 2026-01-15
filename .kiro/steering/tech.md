# DriverOS - Technical Architecture

## Technology Stack
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: localStorage (MVP), Prisma ORM ready for PostgreSQL
- **Testing**: Playwright for E2E, Jest for unit tests
- **Deployment**: Vercel (frontend)
- **Development**: npm, ESLint, TypeScript strict mode

## Architecture Overview
- **Monolithic Next.js app** with API routes for backend logic
- **Client-side analysis engine** for Flash Scan and Full Audit scoring
- **Component-based UI** with reusable dashboard and form components
- **localStorage persistence** for MVP, migration path to database

## Development Environment
- Node.js 18+, npm 9+
- Hot reload for rapid iteration
- TypeScript strict mode enabled

## Code Standards
- TypeScript strict mode enabled
- Tailwind for styling (no custom CSS files)
- Server Components by default, Client Components when needed
- Consistent component patterns across features

## Testing Strategy
- Playwright E2E tests for critical user paths
- Jest unit tests for analysis engines
- 116+ unit tests, 21+ E2E tests

## Performance Requirements
- < 2s initial page load
- < 500ms navigation between pages
- Responsive design for mobile/desktop
- Flash Scan completes in < 5 minutes

## Data Model
- **FlashScanResult**: Quick assessment with accelerator and quick wins
- **FullAuditResult**: 5-engine scores, gear calculation, actions, goals
- **YearPlan**: Annual planning with quarterly items
- **Meeting**: Structured meeting notes with generated actions
