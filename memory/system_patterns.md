# ⚙️ System Patterns

**Last Updated:** 2026-01-08 22:27

## Architecture Principles

- **Client-side only** - No backend, all logic in browser with localStorage.
- **Root-Level Layout** - `AppLayout` is centralized in `app/layout.tsx` to handle global navigation, banners, and theme wrapping once. Pages should be lean fragments of content.
- **Component Composition** - Reusable UI components in `components/` directory.
- **Type safety first** - TypeScript interfaces for all data structures (Domain Model compliance).
- **Test-driven quality** - Strict adherence to E2E pass rates (target: 100%).
- **Performance Monitoring** - Track operation performance and errors using `lib/performance-monitor.ts`.
- **Data Protection** - Use `lib/data-migration.ts` for backup/restore and schema versioning.

## Code Standards

### Naming Conventions
- Components: `PascalCase.tsx`
- Pages/Layouts: `page.tsx`, `layout.tsx`
- Utilities: `camelCase.ts`

### File Organization
- `components/layout/` - Global structure (Sidebar, Header, TopBanner).
- `components/ui/` - Shadcn-inspired base primitives + animation components.
- `lib/` - Analysis logic, data parsers, performance monitoring, data migration.
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
| Animation Performance | Always use GPU acceleration (`transform-gpu`) and respect `prefers-reduced-motion`. |
| Performance Tracking | Use `trackCSVOperation` and `performanceMonitor.trackSync` for backend operations. |

## UX Patterns

- **Theme Switching**: Global context-based theme switching (7 custom themes).
- **Premium Aesthetics**: Use gradients, balanced whitespace, and Outfit/Inter typography.
- **Progressive Disclosure**: High-level gear score → Engine breakdown → Specific actions.
- **Inline Editing**: Goal progress values are editable inline with click-to-edit pattern.
- **Racing Animations**: Button press effects, input focus glow, status transitions with racing theme.

## Animation Patterns (New)

- **Button States**: Use `active:scale-95` for press effects, loading/success/error states with icons.
- **Input Enhancement**: Racing orange focus glow, validation shake, success slide-in animations.
- **Status Transitions**: Smooth color morphing for todo → doing → done with celebrations.
- **Loading States**: Racing-themed spinners with gear design, skeleton loaders with shimmer.
- **Accessibility**: Always include `prefers-reduced-motion` support and proper focus indicators.
- **Performance**: Use CSS transforms and GPU acceleration, avoid layout thrashing.

## Testing Patterns (Refined)

- **Page Object Model**: Centralize locators in `helpers/page-objects.ts`.
- **Role-Based Locators**: Prefer `getByRole('button', { name: '...' })` or `getByRole('heading', { name: '...' })` over `getByText`.
- **Form metadata**: Form components MUST have `name` attributes matching the state keys.
- **Port Configuration**: Tests run on port 3333 (configured in `playwright.config.ts`).
- **Direct Navigation**: For isolated tests, use `page.goto('/route')` instead of complex beforeEach flows.
- **localStorage Mocking**: 13 unit tests fail in Node.js due to localStorage - this is expected behavior.
- **Animation Testing**: Test animation components with `.tsx` extension for JSX support.

## AppLayout Migration Patterns (Current)

- **Centralized wrapping**: The `RootLayout` wraps `{children}` in `<AppLayout>`.
- **Sidebar Integration**: The Sidebar contains the primary navigation. Desktop nav links in Header should be avoided to prevent clutter.
- **State management**: Demo Mode status is detected in `TopBanner` and affects global visibility.

## Dashboard Enhancement Patterns (New)

- **Filter State**: Use `useState` with `{ engine: 'all', owner: 'all', status: 'all' }` default.
- **Filter Comparison**: Use exact string match for engine/owner, lowercase for status.
- **Editable Values**: Use `useState` + `useEffect` pattern for localStorage-backed editable fields.
- **Snapshot Tracking**: Engine history stored in localStorage with max 12 entries.

## Backend Infrastructure Patterns (New)

- **Performance Monitoring**: Use `performanceMonitor.trackSync()` for operations, `trackCSVOperation()` for CSV processing.
- **Error Tracking**: Automatic error logging with context and stack traces in performance monitor.
- **Data Migration**: Use `dataMigration.createBackup()` before schema changes, `getDataHealth()` for diagnostics.
- **System Health**: Monitor slow operations (>1s), error rates, and data corruption with built-in utilities.
