# DriverOS Implementation Handoff

> **Last Updated**: AI Coaching Agent implementation session
> **Plan File**: `PLAN.md` contains the full roadmap
> **Branch**: `claude/add-claude-documentation-im8gU`

---

## Session Summary: AI Coaching Agent (Epic 5 — Partial)

Built a **persistent AI coaching agent** with a **company memory system** that accumulates knowledge about the business over time, providing personalized (not templated) feedback as users navigate the app.

### What Was Built

#### New Files (10 files, ~1,600 lines)

**Core AI System** (`lib/ai/`)
| File | Purpose |
|------|---------|
| `lib/ai/types.ts` | Full type system: `CompanyMemory`, `ChatMessage`, `PageContext`, `MemoryEvent` (8 event types), 17 page IDs |
| `lib/ai/memory.ts` | Load/save/bootstrap memory from localStorage; event processing; timeline tracking; chat history persistence |
| `lib/ai/prompts.ts` | Builds system prompt from: base persona + company memory + page-specific guidance + response rules. Proactive nudge generator |
| `lib/ai/index.ts` | Barrel exports |

**Streaming API**
| File | Purpose |
|------|---------|
| `app/api/ai/chat/route.ts` | SSE streaming endpoint → Claude API. Sends memory + page context + conversation as system prompt. Graceful error handling |

**Chat Widget UI** (`components/ai/`)
| File | Purpose |
|------|---------|
| `components/ai/ChatWidget.tsx` | Floating panel (bottom-right FAB). Suggested questions, proactive nudges, full message history |
| `components/ai/ChatMessage.tsx` | Message bubbles with markdown (bold, bullets), typing indicator |
| `components/ai/ChatInput.tsx` | Auto-resizing textarea, Enter to send, Stop button during streaming |

**Hooks**
| File | Purpose |
|------|---------|
| `hooks/useAICoach.ts` | Main hook: chat state, streaming, memory loading, page-context detection, proactive nudges. Auto-bootstraps from existing data |
| `hooks/useMemoryEvent.ts` | Simple hook any component can call to fire events into memory system |

#### Modified Files (6 files)

| File | Change |
|------|--------|
| `app/layout.tsx` | Added `<ChatWidget />` globally inside `<AppLayout>` |
| `app/flash-scan/page.tsx` | Fires `profile_updated` + `north_star_changed` + `assessment_completed` memory events |
| `app/full-audit/page.tsx` | Fires `assessment_completed` with per-engine scores from `analysis.engines` |
| `app/check-in/page.tsx` | Fires `check_in` events with blocker + win data |
| `.env.example` | Added `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` variables |
| `lib/storage.ts` | Added `COMPANY_MEMORY` and `AI_CHAT_HISTORY` storage keys |

### How It Works

```
User Action (assessment, check-in, etc.)
  ↓
useMemoryEvent() → fires MemoryEvent
  ↓
processMemoryEvent() → updates CompanyMemory (pure function)
  ↓
saveMemory() → localStorage
  ↓
User opens chat → useAICoach() loads memory
  ↓
POST /api/ai/chat → builds system prompt from:
  - Base persona (DriverOS-fluent advisor)
  - Company memory (scores, trends, patterns, timeline)
  - Page context (what user is looking at right now)
  - Conversation history (last 20 messages)
  ↓
Claude API (streaming) → SSE → ChatWidget renders incrementally
```

### Company Memory Structure

The memory accumulates these sections over time:
- **Profile**: name, industry, size band, gear, north star, constraint, role
- **Engine Snapshot**: latest scores + trend per engine, assessment count
- **Action Insights**: completed/abandoned counts, strong/weak engines, preferred effort level
- **Check-In Insights**: streak, recurring blockers (deduplicated), recent wins
- **Timeline**: Last 50 events (assessments, actions, meetings, gear changes)
- **Coach Notes**: AI-generated observations (max 20)

### Proactive Nudges

The system generates nudges based on state:
- No assessment yet → suggests Flash Scan
- Engine trending down → calls out the specific engine
- Recurring blocker in check-ins → suggests converting to `do_now` action
- High action abandonment → suggests adjusting recommendations

---

## Validation

- **TypeScript**: Zero errors in all new/modified files (`npx tsc --noEmit`)
- **Tests**: 212/212 passing, 22/22 suites (`npm test`)
- **No new dependencies**: Uses `fetch()` for Claude API calls (no SDK needed)

---

## To Activate

```bash
# Add to .env.local
ANTHROPIC_API_KEY=sk-ant-...

# Optional: override model (default: claude-sonnet-4-5-20250929)
# ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
```

Without the key, the chat widget appears but returns a friendly "not configured" message.

---

## What's Next (Priority Order)

### Phase 2: Deepen Memory Integration
- [ ] Wire `useMemoryEvent` into action status changes (`app/dashboard/` action cards)
- [ ] Wire into meeting completion (`app/pit-stop/page.tsx`, `app/meetings/`)
- [ ] Wire into year board changes (`app/year-board/`)
- [ ] Wire into Apex Audit (`app/apex-audit/page.tsx`)
- [ ] Add memory event when user parks an idea → tracks avoidance patterns

### Phase 3: Smarter Coaching
- [ ] After AI responds, extract coach observations and save via `addCoachNote()`
- [ ] Add a "What changed since last time" summary when user returns after absence
- [ ] Add page-specific visible data to `PageContext` (e.g., send current engine scores when on dashboard)
- [ ] Implement `isProactiveNudge` mode — coach speaks first without user prompting

### Phase 4: Multi-Org & Persistence
- [ ] Replace hardcoded `ORG_ID = 'default'` with actual org from `useOrg()` context
- [ ] Add Supabase table for `company_memory` (org-scoped) and `chat_sessions`
- [ ] Switch `loadMemory`/`saveMemory` to use data layer pattern (localStorage ↔ Supabase)
- [ ] Add memory migration support (version field already present)

### Phase 5: Polish
- [ ] Animate chat panel open/close with Framer Motion
- [ ] Add keyboard shortcut to toggle chat (Cmd+K or similar)
- [ ] Collapse/expand chat to just the FAB while preserving state
- [ ] Rate-limit API calls (debounce rapid sends)
- [ ] Add token usage tracking / monthly budget

---

## Previously Completed Work

### Epic 1: Multi-Tenant SaaS Infrastructure (COMPLETE)
- Supabase client setup (6 files)
- Database schema with RLS policies
- Auth system (login/signup/password recovery)
- Role gates and permission system
- Data layer abstraction (localStorage ↔ Supabase)
- Environment configuration

### Key Architecture Decisions

1. **Demo Mode**: `NEXT_PUBLIC_DEMO_MODE=true` or no Supabase config → uses localStorage
2. **Data Layer**: All data access via `lib/data/*` (auto-switches localStorage ↔ Supabase)
3. **AI Memory**: localStorage only for now, scoped by org ID, bootstraps from existing data
4. **Auth Flow**: Demo mode bypasses auth; protected routes → `/login?returnTo=<path>`
5. **RLS**: All tables have Row Level Security with `is_member_of_org()` helpers

---

## Key Files to Reference

```
PLAN.md                         # Full implementation roadmap
lib/ai/types.ts                 # AI type system (start here)
lib/ai/memory.ts                # Memory accumulation logic
lib/ai/prompts.ts               # System prompt construction
app/api/ai/chat/route.ts        # Streaming API endpoint
components/ai/ChatWidget.tsx     # Chat UI
hooks/useAICoach.ts             # Main chat state management
hooks/useMemoryEvent.ts         # Memory event hook (wire into pages)
lib/data/*                      # Data layer pattern to follow
lib/supabase/types.ts           # Database schema types
```
