# Install & Run

## Requirements
- Node.js 18+ (or 20+)
- Package manager: pnpm (recommended) or npm
- (Optional) Playwright browsers installed for e2e tests

## Quick start
```bash
pnpm install
pnpm dev
```

Open the app:
- http://localhost:3000

## Tests
Unit tests:
```bash
pnpm test
```

Playwright (e2e):
```bash
pnpm playwright install
pnpm playwright test
```

## Environment variables
For hackathon MVP, keep env minimal.

If you use Supabase later, add:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Troubleshooting
- Port in use: change port or stop the other process.
- Playwright missing browsers: run `pnpm playwright install`.
