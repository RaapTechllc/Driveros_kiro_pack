# DriverOS Completion Spec — Working AI Brain

## Current State
DriverOS is a 345-file Next.js 14 app (TypeScript, Tailwind, shadcn/ui, Supabase) with:
- ✅ Flash Scan (5-min diagnostic), Full Audit, Apex Audit
- ✅ Dashboard with 5-engine scoring (Vision, People, Operations, Revenue, Finance)
- ✅ Action system (do_now/do_next), check-ins, meetings, year board
- ✅ AI chat API (`/api/ai/chat`) with SSE streaming to Claude
- ✅ Company memory system (`lib/ai/memory.ts`) — accumulates knowledge over time
- ✅ Page-aware prompts (`lib/ai/prompts.ts`) — context-specific coaching
- ✅ 92% test coverage, WCAG 2.1 AA, CI/CD

## What Needs Completion
The AI brain scaffolding exists but needs to be FULLY WIRED and ENHANCED:

### 1. AI Chat Widget Integration (Priority: HIGH)
- `components/ai/ChatWidget.tsx`, `ChatInput.tsx`, `ChatMessage.tsx` exist
- Need: Verify these are mounted in the app layout and functional on every page
- Need: Page context detection working (which page is user on → correct PageContext)
- Need: Memory bootstrapping on first load (`bootstrapMemoryFromStorage`)
- Need: Chat history persistence across sessions
- Need: Proactive nudge system (`getProactiveNudge`) triggering on page navigation

### 2. AI Coaching Digest API (Priority: HIGH)  
- `app/api/coaching/digest/route.ts` exists — needs completion
- Should generate daily/weekly AI coaching summaries based on accumulated memory
- Should analyze patterns: recurring blockers, abandoned engines, gear trajectory
- Output: structured digest with 3-5 actionable insights

### 3. Memory Event Wiring (Priority: HIGH)
- Memory event types defined in `lib/ai/types.ts` — all 8 event types
- Need: Every user action in the app must fire the corresponding MemoryEvent
- Flash Scan completion → `assessment_completed`
- Full Audit completion → `assessment_completed`
- Action status change → `action_completed` or `action_abandoned`
- Check-in submission → `check_in`
- Meeting completion → `meeting_held`
- North Star update → `north_star_changed`
- Profile update → `profile_updated`

### 4. Supabase Backend (Priority: MEDIUM)
- Schema exists for demo mode (localStorage) but production needs Supabase
- `lib/supabase/` has client.ts, server.ts, auth.ts, middleware.ts, types.ts
- Need: Supabase migration SQL for all tables
- Need: Toggle between localStorage (demo) and Supabase (production)
- Need: Auth flow working (login, signup, forgot password, OAuth)

### 5. Docker Deployment (Priority: MEDIUM)
- Dockerfile and docker-compose.yml exist
- Need: Verified working build with PostgreSQL 15, Redis 7, app
- Need: Environment variable documentation
- Need: Health check endpoints

### 6. Tests for AI Features (Priority: MEDIUM)
- Need: Tests for chat widget, memory system, coaching digest
- Need: E2E test for full AI conversation flow

## Tech Stack
- Next.js 14 (App Router), TypeScript strict, Tailwind + shadcn/ui
- Supabase (auth + DB), Zod validation
- Claude API (streaming SSE) for AI
- Jest + Playwright for testing
- Docker deployment

## Key Files
- `app/api/ai/chat/route.ts` — streaming chat endpoint (WORKING)
- `lib/ai/prompts.ts` — system prompt builder with page context
- `lib/ai/memory.ts` — company memory accumulation
- `lib/ai/types.ts` — all type definitions
- `components/ai/ChatWidget.tsx` — chat UI component
- `app/api/coaching/digest/route.ts` — coaching digest endpoint
- `CLAUDE.md` — full project reference

## Constraints
- Must work with ANTHROPIC_API_KEY env var (Claude API)
- Demo mode must work without Supabase (localStorage only)
- Keep existing test coverage — don't break working tests
- Follow existing code conventions (pure functions for business logic, Zod validation)
