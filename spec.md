# DriverOS AI Coach — Phase 2-3 Implementation Spec

## Architecture Overview

The AI coaching system has three layers: a **memory engine** (`lib/ai/memory.ts`) that accumulates company knowledge from events, a **prompt builder** (`lib/ai/prompts.ts`) that combines memory + page context into system prompts, and a **streaming chat API** (`app/api/ai/chat/route.ts`) that sends it all to Claude. The `useAICoach` hook orchestrates state on the client. Memory events flow in from pages via `useMemoryEvent`, and the floating `ChatWidget` renders the chat globally. Phase 1 built the full system. Phase 2 (just completed) wired memory events into all remaining pages. This spec covers Phase 3 (deeper intelligence) and Phase 4 (production hardening).

---

## Milestone 1: Deeper Coach Intelligence (Phase 3)

Enrich the coaching context by extracting insights from AI responses, sending page-visible data as context, and generating "what changed" summaries after assessments.

### Deliverables

1. **Coach note extraction** (`hooks/useAICoach.ts`) — After each AI response completes streaming, scan for actionable observations and save them to `memory.coachNotes` via `addCoachNote()`.

2. **Page-visible data injection** — Update 5 key pages to pass `visibleData` into the chat context so the coach can reference actual on-screen numbers:
   - `app/dashboard/page.tsx` — engine scores, gear, accelerator KPI, action counts
   - `app/flash-scan/page.tsx` — form state or result data
   - `app/full-audit/page.tsx` — engine scores, gear, actions
   - `app/check-in/page.tsx` — today's check-in state (blocker, win, streak)
   - `app/pit-stop/page.tsx` — last week summary, plan state

3. **"What changed" memory summaries** (`lib/ai/memory.ts`) — When `assessment_completed` is processed, compute and store a human-readable diff (e.g., "Vision +8, People -12, Gear: 2→3") in the timeline entry.

4. **Multi-org memory support** (`hooks/useMemoryEvent.ts`, `hooks/useAICoach.ts`) — Replace hardcoded `ORG_ID = 'default'` with actual org ID from `useOrg()` context. Memory is already keyed by `orgId` in storage — the hooks just need to pass the real value.

### Acceptance Criteria

- [ ] AI assistant responses that contain observations (pattern: "I notice...", "It looks like...", "Your [engine] has...") are extracted and stored in `memory.coachNotes`
- [ ] Coach can reference current dashboard scores, check-in state, and form data in responses
- [ ] After a Full Audit, memory timeline shows "Vision 72→80, People 58→46" style diffs
- [ ] Memory events use real org ID from OrgProvider (not hardcoded 'default')
- [ ] All 212+ existing unit tests continue to pass
- [ ] TypeScript compiles cleanly (no new errors introduced)

### Risks & Dependencies

- Coach note extraction uses heuristic pattern matching — may need tuning. Start with simple prefix detection, iterate.
- `visibleData` injection requires the page to have loaded data before the chat widget reads it — timing is natural since ChatWidget is a child of the page.
- Multi-org change is safe since `loadMemory` already keys by `orgId` — just threading the real value through.

---

## Milestone 2: Production Hardening (Phase 4)

Rate limiting, Supabase persistence for memory/chat, and token budget awareness.

### Deliverables

1. **Rate limiting on `/api/ai/chat`** — In-memory sliding window: max 20 requests per minute per IP. Return 429 with retry-after header.

2. **Supabase persistence for memory** — When Supabase is configured, save/load `CompanyMemory` to a `coach_memory` table instead of localStorage. Keep localStorage as fallback in demo mode.

3. **Supabase persistence for chat history** — Same pattern: `coach_chat_history` table, keyed by org_id, with last 100 messages.

4. **Token budget awareness** — Track approximate token usage per org per day in memory. Add a soft warning in chat when approaching a configurable daily limit. No hard enforcement yet.

### Acceptance Criteria

- [ ] Rapid repeated requests to `/api/ai/chat` return 429 after 20/minute
- [ ] With Supabase configured, memory persists across browser sessions
- [ ] Demo mode continues to work with localStorage only
- [ ] Chat history survives browser clear when using Supabase
- [ ] Token usage estimate shown in chat header when >80% of daily budget

### Risks & Dependencies

- Rate limiting is in-memory — resets on server restart. Acceptable for MVP; Redis-backed for production scale.
- Supabase tables need SQL migration. Provide migration file but cannot run it automatically.
- Token counting is approximate (chars / 4) — accurate enough for budget awareness.

---

## Milestone 3: Polish & UX (Phase 5)

Animations, keyboard shortcuts, and UX refinements.

### Deliverables

1. **Framer Motion animations on ChatWidget** — Smooth open/close, message entry animations replacing CSS-only transitions.
2. **Keyboard shortcuts** — `Cmd+K` / `Ctrl+K` to toggle chat. `Escape` to close. Focus management.
3. **Chat widget responsive improvements** — Full-width on mobile, proper safe-area handling.

### Acceptance Criteria

- [ ] Chat panel slides in/out with spring physics via Framer Motion
- [ ] Messages animate in on arrival
- [ ] Cmd+K toggles chat from any page
- [ ] Escape closes chat and returns focus
- [ ] Chat is usable on mobile viewports

### Risks & Dependencies

- Framer Motion is already a dependency — no new install needed.
- Keyboard shortcut must not conflict with browser shortcuts or other app bindings.
