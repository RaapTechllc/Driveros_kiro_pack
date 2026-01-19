# DriverOS Production MVP Plan

> **Goal**: Transform hackathon build into paid SaaS product at $100+/user/month
> **Source**: Synthesized from NEWPLAN.md with implementation details
> **Status**: Epic 1 COMPLETE - Continue with Epic 2

---

## Executive Summary

DriverOS is an **execution OS** that turns a single North Star into weekly wins. The current hackathon MVP has the right shell (Flash Scan, Full Audit, Dashboard, Meetings, Year Board) but needs production infrastructure for:
- Multi-device sync & multi-user teams
- Ongoing execution rhythm (daily/weekly habits)
- AI cost control at scale
- Billing & permissions

---

## Phase 1: Production Foundation (Month 1)

### Epic 1: Multi-Tenant SaaS Infrastructure ✅ COMPLETE

**Files Created:**
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/middleware.ts` - Auth middleware utilities
- `lib/supabase/types.ts` - Full database types
- `lib/supabase/auth.ts` - Auth helper functions
- `lib/supabase/index.ts` - Module exports
- `middleware.ts` - Next.js auth middleware
- `supabase/migrations/001_initial_schema.sql` - Database schema
- `supabase/migrations/002_row_level_security.sql` - RLS policies
- `components/providers/AuthProvider.tsx` - Auth context
- `components/providers/OrgProvider.tsx` - Org context
- `components/auth/RoleGate.tsx` - Permission gates
- `components/auth/AuthGuard.tsx` - Auth wrapper
- `hooks/useRequireAuth.ts` - Protected page hook
- `app/login/page.tsx`, `app/signup/page.tsx` - Auth pages
- `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`
- `lib/data/*` - Data layer (localStorage ↔ Supabase abstraction)

**Tasks:**
- [x] Create Supabase project (Postgres + Auth) and wire env config
- [x] Add core tables with RLS policies:
  - [x] `orgs` - organization/workspace
  - [x] `profiles` - user profiles
  - [x] `memberships` - user ↔ org relationship with roles
- [x] Implement auth flows (login, logout, invite, password reset)
- [x] Add role gates in UI:
  - [x] Owner (full access)
  - [x] Member (read/write own data)
  - [x] Coach (read + comment + assign across clients)
- [x] Migrate localStorage data to server-side persistence:
  - [x] `assessments` (flash scan + full audit snapshots)
  - [x] `actions` (status, owner, due, engine)
  - [x] `meetings` (type, date, notes)
  - [x] `accelerators` (metric definition + values)
- [x] Keep "Demo Mode" working with local sample data (feature flag)

**Manual Steps Required:**
```bash
npm install @supabase/supabase-js @supabase/ssr
# Then configure .env.local with Supabase credentials
# Run SQL migrations in Supabase dashboard
```

**Database Schema (Minimum):**
```sql
-- Core tables
orgs (id, name, created_at)
users (id, email, name, avatar_url)
memberships (user_id, org_id, role, created_at)

-- Business data
north_star (org_id, goal, vehicle, constraint)
assessments (org_id, type, data, schema_version, created_at)
engines (org_id, engine, score, date)
accelerators (org_id, metric, target, current, date)
actions (org_id, title, why, owner, engine, status, due_date)
meetings (org_id, type, date, notes, decisions, actions)
```

### Epic 2: North Star Kernel & Guardrails

**Critical Files:**
- `components/onboarding/NorthStarWizard.tsx`
- `lib/guardrails.ts`
- `components/dashboard/ParkItInbox.tsx`

**Tasks:**
- [ ] Build North Star setup wizard (goal, vehicle, constraint)
- [ ] Store as `north_star` per org in database
- [ ] Require every Action to link to North Star + Engine
- [ ] Add "Park it" inbox for non-aligned ideas
- [ ] Add "One obsession" mode (single active goal toggle)

**Guardrail Logic:**
```typescript
// Every new idea/task must pass guardrails
interface TaskGuardrails {
  linksToNorthStar: boolean;
  linksToVehicle: boolean;
  addressesConstraint: boolean;
}
// If all false → auto-park the idea
```

### Epic 3: Daily Check-In (Habit Loop)

**Critical Files:**
- `app/check-in/page.tsx`
- `components/check-in/DailyCheckIn.tsx`
- `lib/streaks.ts`

**Tasks:**
- [ ] Add Daily Check-In UI (3 questions + 1-click submit):
  1. "Did you do the 1–3 actions?"
  2. "Any blocker?"
  3. "Any win/lesson?"
- [ ] Store check-in as `meeting` of type `warm_up`
- [ ] Update Action statuses from check-in responses
- [ ] Show streaks and "minimum viable day" tracker
- [ ] Add notifications stub (in-app first, then push/email)

**Why Daily Check-In Wins:**
- Respects time (1-2 minutes)
- Creates habit
- Provides data without work

---

## Phase 2: Weekly Planning & Coach Value (Month 2)

### Epic 4: Weekly Pit Stop (Autoplan)

**Critical Files:**
- `lib/ai-operations/generate-weekly-plan.ts`
- `app/pit-stop/page.tsx`
- `components/pit-stop/PlanApproval.tsx`

**Tasks:**
- [ ] Create weekly planning schema (inputs, outputs)
- [ ] Implement `generate_weekly_plan` Operation (AI + rules hybrid):
  - Inputs: North Star, accelerator trend, open blockers, last week's misses
  - Output: 1-3 prioritized actions for the week
- [ ] Add approval UI (accept plan → creates Actions)
- [ ] Add "capacity guard" (max 3 actions per week)
- [ ] Add review UI (last week done / missed with learnings)

### Epic 5: AI Gateway & Cost Controls

**Critical Files:**
- `lib/ai-gateway/index.ts` - Main gateway interface
- `lib/ai-gateway/adapters/` - Provider adapters
- `lib/ai-gateway/metering.ts` - Token/cost tracking
- `lib/ai-gateway/cache.ts` - Response caching

**Tasks:**
- [ ] Implement LLM Gateway interface:
  ```typescript
  interface AIOperation {
    name: string;
    inputSchema: ZodSchema;
    outputSchema: ZodSchema;
    maxTokenBudget: number;
    modelPolicy: 'cheap' | 'smart' | 'best';
    cacheTTL?: number;
  }
  ```
- [ ] Add OpenRouter adapter + model routing policy
- [ ] Add OpenAI + Anthropic + xAI adapter stubs (future)
- [ ] Implement token/cost meter per operation
- [ ] Add budgets + hard caps:
  - [ ] Per-org monthly budget
  - [ ] Per-user daily budget
  - [ ] Graceful fallback to rules engine when capped
- [ ] Add caching keyed by `(operation + input_hash)`
- [ ] Add audit log for AI outputs (for coach trust)

**Cost Control Rules:**
1. Default to rules engine first
2. Use AI only for "decision support" and "writing"
3. Precompute weekly reports in background
4. Cache by (org_id + operation + input_hash)
5. Use cheap models for drafts
6. Upgrade model only when confidence is low

### Epic 6: Ruthless Prioritizer

**Critical Files:**
- `lib/ai-operations/prioritize-actions.ts`
- `components/dashboard/PrioritizationBoard.tsx`

**Tasks:**
- [ ] Define scoring rubric:
  - Impact (1-5)
  - Urgency (1-5)
  - Leverage (1-5)
  - Effort (1-5, inverse)
- [ ] Implement `prioritize_actions` Operation
- [ ] Add UI: "Do Now / Do Next / Park" kanban board
- [ ] Add "kill list" history (what got deprioritized and why)

### Epic 7: Road Report (Weekly PDF)

**Critical Files:**
- `lib/reports/road-report.ts`
- `app/api/reports/weekly/route.ts`
- `lib/pdf-generator.ts`

**Tasks:**
- [ ] Define report template (HTML → PDF):
  - Accelerator trend chart
  - Engine colors/scores
  - Actions done/missed
  - Blockers resolved/open
  - Next week plan
- [ ] Generate weekly report in background job
- [ ] Store in `artifacts` table + allow download
- [ ] Include coach notes section

---

## Phase 3: Knowledge & Compounding (Month 3)

### Epic 8: Knowledge Bank & Playbooks (RAG)

**Critical Files:**
- `lib/knowledge/embeddings.ts`
- `lib/knowledge/retrieval.ts`
- `lib/ai-operations/brain-dump-triage.ts`
- `app/playbooks/page.tsx`

**Database Tables:**
```sql
documents (id, org_id, title, type, content, created_at)
document_chunks (id, document_id, content, chunk_index)
embeddings (chunk_id, embedding vector, model)
```

**Tasks:**
- [ ] Add documents + chunks + embeddings pipeline
- [ ] Upload and tag playbooks (sales/ops/finance defaults)
- [ ] Build retrieval step for AI operations
- [ ] Implement `brain_dump_triage` Operation:
  - Voice/text brain dump input
  - AI turns it into: tasks, issues, SOP drafts, agenda items
  - Applies guardrails + prioritizer
- [ ] Implement "Run playbook" → creates plan + actions

### Epic 9: Consultant/Coaching Portal

**Critical Files:**
- `app/coach/page.tsx`
- `app/coach/clients/page.tsx`
- `components/coach/ClientHealthGrid.tsx`

**Tasks:**
- [ ] Coach can manage multiple orgs (coach membership role)
- [ ] Coach view: health dashboard across clients
  - Engine scores grid
  - Accelerator trends
  - Red flags/blockers
- [ ] Coach can comment + assign actions
- [ ] Export share links (read-only) for stakeholders

### Epic 10: Billing

**Critical Files:**
- `app/api/stripe/` - Stripe webhook handlers
- `lib/billing/plans.ts`
- `app/settings/billing/page.tsx`

**Plans:**
- **Base** ($49/mo): 1 user, 5 AI operations/day
- **Pro** ($99/mo): 5 users, 50 AI operations/day, coach access
- **Power** ($149/mo): unlimited users, unlimited AI, priority support

**Tasks:**
- [ ] Stripe plans: Base / Pro / Power
- [ ] Enforce limits by plan (users, AI budget, reports)
- [ ] Upgrade/downgrade flows
- [ ] Usage dashboard

### Epic 11: Quality & Security

**Tasks:**
- [ ] Server-side tests for RLS + critical endpoints
- [ ] Add rate limits on AI endpoints
- [ ] Add PII redaction before embeddings
- [ ] Add production error tracking (Sentry)
- [ ] Security audit for auth flows

---

## Architecture Reference

### Target Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 App Router |
| Backend | Next.js API Routes + Server Actions |
| Database | Postgres + RLS (Supabase) |
| Auth | Supabase Auth |
| ORM | Supabase JS Client |
| Background Jobs | Inngest / QStash |
| Vector Store | pgvector in Postgres |
| LLM Gateway | OpenRouter + direct providers |
| Observability | Sentry + product analytics |

### Key Services
1. **Web App**: UI + server actions
2. **API/Backend**: orgs, users, roles, tasks, meetings, audits
3. **LLM Gateway**: provider adapters, cost meter, caching, prompt registry
4. **Job Runner**: weekly reports, embedding jobs, scheduled nudges

---

## Build Order (Least Disruptive)

1. **Add DB behind feature flag** - Keep localStorage demo mode
2. **Mirror existing types into tables** - Don't redesign everything
3. **Move only "source of truth" to DB** - UI stays mostly the same
4. **Add AI Operations as new layer** - Don't sprinkle LLM calls everywhere

---

## MVP Definition

A paying customer should be able to:
1. Define North Star
2. Run Flash Scan + Full Audit
3. See dashboard
4. Run daily check-in (1-2 minutes)
5. Run weekly pit stop (10-15 minutes)
6. Get a weekly Road Report
7. Invite a coach
8. Stay under AI budget

---

## Open Questions (Answer Early)

1. **Coach-led or self-serve?** - Is the paid product "coach-led" (sell services) or "self-serve SaaS"?
2. **Industry defaults?** - Bake in construction defaults or stay industry-agnostic?
3. **Non-negotiable daily action?** - Check-in, or something else?

---

## Verification Plan

### After Epic 1 (Multi-tenant):
- [ ] Create test org + users with different roles
- [ ] Verify RLS policies (user can't see other org's data)
- [ ] Test auth flows (login, logout, password reset)
- [ ] Verify demo mode still works

### After Epic 3 (Daily Check-In):
- [ ] Complete daily check-in flow
- [ ] Verify action status updates
- [ ] Check streak tracking

### After Epic 5 (AI Gateway):
- [ ] Test AI operation with cost tracking
- [ ] Verify caching works (same input = cached response)
- [ ] Test budget enforcement (cap hit → fallback)

### After Epic 7 (Road Report):
- [ ] Generate PDF report
- [ ] Verify all data sections populated
- [ ] Test download functionality

---

## Files to Modify/Create Summary

### New Directories:
- `lib/supabase/` - Database client and types
- `lib/ai-gateway/` - LLM abstraction layer
- `lib/ai-operations/` - Specific AI operation implementations
- `lib/knowledge/` - RAG and embeddings
- `lib/billing/` - Stripe integration
- `lib/reports/` - PDF generation
- `app/api/` - API routes for backend
- `app/check-in/` - Daily check-in page
- `app/pit-stop/` - Weekly planning page
- `app/coach/` - Coaching portal
- `app/playbooks/` - Playbook management

### Key Existing Files to Modify:
- `app/layout.tsx` - Add auth provider
- `app/dashboard/page.tsx` - Integrate DB data source
- `lib/types.ts` - Add new interfaces for DB models
- `middleware.ts` - Add auth middleware (new file)
