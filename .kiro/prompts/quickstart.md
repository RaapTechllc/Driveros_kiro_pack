# Kiro CLI Quick Start Wizard (DriverOS)

This wizard helps bootstrap new features for DriverOS.

## Project Context

DriverOS is a business operating system with:
- **Flash Scan**: 5-minute quick assessment
- **Full Audit**: Comprehensive 5-engine analysis
- **Dashboard**: Signal Board + Action Bay
- **Year Board**: Annual planning
- **Meetings**: Structured cadences

## Quick Start Commands

```bash
# Development
npm install
npm run dev

# Testing
npm test           # Unit tests
npm run test:e2e   # E2E tests

# Build
npm run build
```

## Feature Development Flow

1. **Plan**: Create spec in `.kiro/specs/[feature]/`
2. **Design**: Define components and data models
3. **Implement**: Build feature incrementally
4. **Test**: Add unit and E2E tests
5. **Document**: Update DEVLOG.md

## Key Files

- `lib/types.ts` - TypeScript interfaces
- `lib/flash-analysis.ts` - Flash Scan engine
- `lib/full-audit-analysis.ts` - Full Audit engine
- `app/dashboard/page.tsx` - Main dashboard

## Constraints

- Max 3 departments
- Weekly accelerator cadence
- 5-minute Flash Scan
- Light/dark mode support
