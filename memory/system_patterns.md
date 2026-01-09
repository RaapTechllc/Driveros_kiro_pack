# ⚙️ System Patterns

**Last Updated:** 2026-01-08 19:08

## Architecture Principles

- **Client-side only** - No backend, all logic in browser with localStorage.
- **Root-Level Layout** - `AppLayout` is centralized in `app/layout.tsx` to handle global navigation, banners, and theme wrapping once. Pages should be lean fragments of content.
- **Component Composition** - Reusable UI components in `components/` directory.
- **Type safety first** - TypeScript interfaces for all data structures (Domain Model compliance).
- **Test-driven quality** - Strict adherence to E2E pass rates (target: 100%).

## Code Standards

### Naming Conventions
- Components: `PascalCase.tsx`
- Pages/Layouts: `page.tsx`, `layout.tsx`
- Utilities: `camelCase.ts`

### File Organization
- `components/layout/` - Global structure (Sidebar, Header, TopBanner).
- `components/ui/` - Shadcn-inspired base primitives.
- `lib/` - Analysis logic and data parsers.
- `tests/e2e/helpers/` - Page Objects and test data.

## 🚨 Known Gotchas

| Gotcha | Solution |
|--------|----------|
| Duplicate Layouts | Remove `AppLayout` from individual pages; rely on `app/layout.tsx`. |
| Strict Mode Failures | Use `getByRole` with `name` or `exact: true` to avoid matching multiple elements with same text. |
| Missing Input Metadata | Always add `name="..."` to Select/Input components for reliable test targeting. |
| localStorage SSR | Use `useEffect` for data hydration to avoid hydration mismatch. |
| Port 3000 Conflicts | Playwright uses port 3333 to avoid conflicts with other dev servers. |
| Rationale Sentences | All rationale strings must end with periods (steering doc requirement). |
| Filter Casing | ActionFilters uses exact casing for engine/owner (e.g., "Owner", "Operations"), lowercase for status. |
| team-roster.ts | Used by ActionCard for team assignment - do not delete without removing integration. |

## UX Patterns

- **Theme Switching**: Global context-based theme switching (7 custom themes).
- **Premium Aesthetics**: Use gradients, balanced whitespace, and Outfit/Inter typography.
- **Progressive Disclosure**: High-level gear score → Engine breakdown → Specific actions.
- **Inline Editing**: Goal progress values are editable inline with click-to-edit pattern.

## Testing Patterns (Refined)

- **Page Object Model**: Centralize locators in `helpers/page-objects.ts`.
- **Role-Based Locators**: Prefer `getByRole('button', { name: '...' })` or `getByRole('heading', { name: '...' })` over `getByText`.
- **Form metadata**: Form components MUST have `name` attributes matching the state keys.
- **Port Configuration**: Tests run on port 3333 (configured in `playwright.config.ts`).
- **Direct Navigation**: For isolated tests, use `page.goto('/route')` instead of complex beforeEach flows.
- **localStorage Mocking**: 13 unit tests fail in Node.js due to localStorage - this is expected behavior.

## AppLayout Migration Patterns (Current)

- **Centralized wrapping**: The `RootLayout` wraps `{children}` in `<AppLayout>`.
- **Sidebar Integration**: The Sidebar contains the primary navigation. Desktop nav links in Header should be avoided to prevent clutter.
- **State management**: Demo Mode status is detected in `TopBanner` and affects global visibility.

## Dashboard Enhancement Patterns (New)

- **Filter State**: Use `useState` with `{ engine: 'all', owner: 'all', status: 'all' }` default.
- **Filter Comparison**: Use exact string match for engine/owner, lowercase for status.
- **Editable Values**: Use `useState` + `useEffect` pattern for localStorage-backed editable fields.
- **Snapshot Tracking**: Engine history stored in localStorage with max 12 entries.
