# DriverOS production path MVP plan (post-hackathon)

> Goal: turn the hackathon build into a paid product you can use internally + sell to clients.
> Target: $100+/user/month with strong margins by controlling LLM cost per user.

## 1) Product thesis

DriverOS is an **execution OS**.
It turns a single North Star into weekly wins.

Users do not need more ideas.
They need:
- A clear target.
- A short list of actions.
- A tight rhythm.
- A system that remembers.

Your current app already has the right shell:
- Flash Scan and Full Audit.
- A dashboard (Signal Board + Accelerator + Action Bay).
- Meeting templates (Warm‑Up, Pit Stop, Full Tune‑Up).
- Import/export and a performance monitor.

## 2) What you already have (and why it matters)

From the repo README:
- Next.js 14 App Router + Tailwind.
- State is React + **localStorage**.
- Analysis is a **client-side rules engine**.
- Flash Scan + Full Audit + Dashboard + Meeting Templates are marked “Ready”.

This is perfect for a hackathon.
It is not enough for a paid SaaS.
Because users will expect:
- Multi-device sync.
- Multi-user teams.
- Audit logs.
- Billing.
- Reliability.

(Repo references: architecture + features.)

## 3) Heavy critique (what will break at $100/mo)

### 3.1 Data + trust
**LocalStorage is a dead end for paid teams.**
You cannot support:
- multiple users per org,
- shared dashboards,
- coach access,
- server-side reports,
- proper permissions.

Fix: move to multi-tenant DB with RLS.

### 3.2 The product promise vs the product behavior
Right now the app is an assessment + dashboard.
That helps once.
People pay monthly for **ongoing execution**.

Fix: “daily/weekly autopilot”.
One click per day.
One review per week.

### 3.3 AI cost can destroy margins
If users can chat “forever”, cost explodes.
You need a **metered system**.
Not unlimited free-form chat.

Fix: use AI on rails:
- small number of “routines”
- fixed inputs
- cached outputs
- cheap models for most steps
- expensive models only when needed

### 3.4 Complexity risk
The #1 way you lose adoption is overwhelm.

Fix: aggressive simplification.
Default to:
- 1 goal
- 1 weekly accelerator
- 3 actions max

Everything else is behind an “Advanced” drawer.

## 4) The $100/mo value prop (what people pay for)

People pay $100/mo when you do 3 things:

### A) You create focus
You kill noise.
You choose the 1–3 actions that move the goal.

### B) You create follow-through
You make execution easy.
You bring them back daily.
You show progress weekly.

### C) You create compounding memory
Nothing is lost.
Every win becomes a template.
Every lesson becomes a playbook.

## 5) The OS model (how this maps to the “AI operating system” ideas)

Use the same mental model as the video:

### 5.1 Strategic layer (always-on context)
- North Star goal
- chosen vehicle
- current constraint / bottleneck
- “definition of done” for the next 90 days

### 5.2 Execution layer (what happens daily)
- daily check-in
- 3 actions
- blockers
- next meeting agenda

### 5.3 Knowledge + playbooks
- your frameworks
- client SOPs
- past successful outputs

### 5.4 Memory + compounding
- logs of actions + outcomes
- weekly/monthly insights

## 6) Top features to build next (ranked: impact x low friction)

### P0 (must-have for paid MVP)

1) **1-click Daily Check‑In**
- One screen.
- Three questions:
  - “Did you do the 1–3 actions?”
  - “Any blocker?”
  - “Any win/lesson?”
- Then the system updates the dashboard.

Why it wins:
- It respects time.
- It creates habit.
- It gives you data without work.

2) **Weekly Pit Stop autoplan**
- Generates next week’s 1–3 actions from:
  - North Star,
  - accelerator trend,
  - open blockers,
  - last week’s misses.
- User approves with one click.

3) **Goal Guardrails (kill switch)**
- Any new idea/task must link to:
  - North Star,
  - vehicle,
  - constraint.
- If it can’t, it gets parked.

4) **Multi-tenant + auth + roles**
- Org/workspace
- Owner
- Team member
- Coach (read + comment + assign)

5) **AI usage metering + budgets**
- Track tokens/cost per org + per user + per operation.
- Put hard caps.
- Graceful fallback (rules engine only) when capped.

### P1 (what makes it feel “premium”)

6) **Ruthless Prioritizer**
- An “agent” that scores tasks by:
  - impact,
  - urgency,
  - leverage,
  - effort.
- Output: “Do Now / Do Next / Park”.

7) **Road Report (coach-ready PDF)**
- Weekly summary:
  - accelerator trend,
  - engine colors,
  - actions done,
  - blockers,
  - next week plan.

8) **Capture → Validate → Execute inbox**
- Voice/text brain dump.
- AI turns it into:
  - tasks,
  - issues,
  - SOP drafts,
  - meeting agenda items.
- With guardrails + prioritizer.

### P2 (scale + retention + moat)

9) **Playbook library + “run this playbook”**
- You ship default playbooks (sales, ops, finance).
- Coaches add custom playbooks.
- The system turns a playbook into a task plan.

10) **Integrations that reduce friction**
- Calendar: auto-create “Pit Stop” event.
- Slack/Teams: daily check-in prompt.
- QuickBooks/HubSpot read-only: auto-populate metrics.

11) **Model upgrades without rewriting your app**
- Model router.
- Prompt registry.
- Eval harness.

## 7) AI system design (future-proof + cost controlled)

### 7.1 Use “workflows”, not free chat
Your unit of AI cost should be an **Operation**.
Examples:
- `generate_weekly_plan`
- `summarize_week`
- `ruthless_prioritizer`
- `brain_dump_triage`

Each Operation has:
- fixed input schema
- clear output schema
- max token budget
- model policy
- caching

### 7.2 When to use real agent frameworks
You can copy their best ideas without their complexity.

Inspiration:
- LangGraph: stateful, long-running agent workflows.
- AutoGen / CrewAI: multi-agent specialization.
- LlamaIndex: RAG for your knowledge.

But for MVP:
- Start with 5–8 Operations.
- Add specialization only if needed.

### 7.3 Model provider abstraction
Build a single “LLM Gateway” layer.
It hides vendor details.

Why:
- You can swap models.
- You can route by cost/perf.
- You can add fallbacks.

OpenRouter is a good fit because it normalizes schemas and routes across providers.

Also plan for direct providers.
Some APIs are OpenAI-compatible.

## 8) Architecture spec (production MVP)

### 8.1 Target stack
- Next.js App Router (keep your current base)
- Postgres + RLS (Supabase recommended)
- Auth (Supabase Auth or Clerk)
- ORM (Prisma or Drizzle)
- Background jobs (Inngest / QStash / BullMQ)
- Vector store (pgvector in Postgres to start)
- Observability (Sentry + product analytics)

### 8.2 Key services

**Web app**
- UI + server actions

**API / backend**
- orgs, users, roles
- tasks, meetings, audits
- AI operations endpoint

**LLM Gateway**
- provider adapters
- cost meter
- caching
- prompt registry

**Job runner**
- weekly report generation
- embedding jobs
- scheduled nudges

### 8.3 Data model (minimum)

Core tables:
- `orgs`
- `users`
- `memberships` (user ↔ org, role)
- `north_star` (goal, vehicle, constraint)
- `assessments` (flash + full audit snapshots)
- `engines` (scores by date)
- `accelerators` (metric definition + values)
- `actions` (status, owner, due, engine)
- `meetings` (type, date, notes)
- `issues` (blockers)
- `artifacts` (playbooks, SOPs, exports)
- `ai_operations` (type, inputs hash, outputs, token usage, cost)

Vector tables:
- `documents`
- `document_chunks`
- `embeddings`

## 9) Cost control plan (protect gross margin)

You want a software margin.
So you must cap AI.

Rules:
1) **Default to rules engine first.**
2) Use AI only for “decision support” and “writing”.
3) Precompute weekly reports in background.
4) Cache by (org_id + operation + input_hash).
5) Use cheap models for drafts.
6) Upgrade model only when confidence is low.

Implementation:
- Per-org monthly AI budget.
- Per-user daily AI budget.
- Hard cap + soft warnings.
- “AI credits” for power users.

## 10) MVP definition

A paying customer should be able to:
1) Define North Star.
2) Run Flash Scan + Full Audit.
3) See dashboard.
4) Run daily check-in (1–2 minutes).
5) Run weekly pit stop (10–15 minutes).
6) Get a weekly Road Report.
7) Invite a coach.
8) Stay under AI budget.

## 11) Roadmap (next few months)

### Month 1: SaaS foundation + daily habit
- Auth + orgs + roles
- DB persistence for existing objects
- Daily Check‑In
- AI usage metering

### Month 2: weekly planning + coach value
- Weekly Pit Stop autoplan
- Ruthless Prioritizer
- Road Report PDF
- Coach portal

### Month 3: knowledge + compounding
- Brain dump inbox
- Knowledge bank + RAG
- Playbook runner
- Basic integrations (Slack + Calendar)

## 12) Build order (least abrasive to your current code)

1) **Add DB behind a feature flag.**
Keep localStorage demo mode.
2) **Mirror existing types into tables.**
Do not redesign everything.
3) **Move only the “source of truth” to DB.**
UI stays mostly the same.
4) **Add AI Operations as a new layer.**
Do not sprinkle LLM calls everywhere.

## 13) Implementation task list (epics + checkboxes)

### Epic 1 — Production foundation (multi-tenant SaaS)
- [ ] Create Supabase project (Postgres + Auth) and wire env config
- [ ] Add `orgs`, `users`, `memberships` tables + RLS policies
- [ ] Implement auth flows (login, logout, invite)
- [ ] Add role gates in UI (Owner, Member, Coach)
- [ ] Add server-side persistence for:
  - [ ] assessments
  - [ ] actions
  - [ ] meetings
  - [ ] accelerators
- [ ] Keep “Demo Mode” working (local sample data)

### Epic 2 — North Star kernel + guardrails
- [ ] Build North Star setup wizard (goal, vehicle, constraint)
- [ ] Store as `north_star` per org
- [ ] Require every Action to link to North Star + Engine
- [ ] Add “Park it” inbox for non-aligned ideas
- [ ] Add “One obsession” mode (single active goal)

### Epic 3 — Daily Check‑In (low friction habit loop)
- [ ] Add Daily Check‑In UI (3 questions + 1-click submit)
- [ ] Store check-in as a `meeting` of type `warm_up`
- [ ] Update Action statuses from the check-in
- [ ] Show streaks and “minimum viable day”
- [ ] Add notifications stub (in-app first)

### Epic 4 — Weekly planning (Pit Stop autoplan)
- [ ] Create weekly planning schema (inputs, outputs)
- [ ] Implement `generate_weekly_plan` Operation (AI + rules)
- [ ] Add approval UI (accept plan → creates Actions)
- [ ] Add “capacity guard” (max 3 actions)
- [ ] Add review UI (last week done / missed)

### Epic 5 — AI gateway + cost controls
- [ ] Implement LLM Gateway interface (provider adapters)
- [ ] Add OpenRouter adapter + model routing policy
- [ ] Add OpenAI + Anthropic + xAI adapter stubs (future)
- [ ] Implement token/cost meter per operation
- [ ] Add budgets + hard caps (org + user)
- [ ] Add caching keyed by (operation + input_hash)
- [ ] Add audit log for AI outputs (for coach trust)

### Epic 6 — Ruthless Prioritizer
- [ ] Define scoring rubric (impact/urgency/leverage/effort)
- [ ] Implement `prioritize_actions` Operation
- [ ] Add UI: “Do Now / Do Next / Park” board
- [ ] Add “kill list” history (what got deprioritized and why)

### Epic 7 — Road Report (weekly PDF)
- [ ] Define report template (HTML → PDF)
- [ ] Generate weekly report in background job
- [ ] Store in `artifacts` + allow download
- [ ] Include coach notes section

### Epic 8 — Knowledge bank + playbooks (RAG)
- [ ] Add `documents` + `document_chunks` + embeddings pipeline
- [ ] Upload and tag playbooks (sales/ops/finance)
- [ ] Build retrieval step for AI operations
- [ ] Implement `brain_dump_triage` Operation
- [ ] Implement “Run playbook” → creates plan + actions

### Epic 9 — Consultant / coaching portal
- [ ] Coach can manage multiple orgs
- [ ] Coach view: health dashboard across clients
- [ ] Coach can comment + assign actions
- [ ] Export share links (read-only) for stakeholders

### Epic 10 — Billing
- [ ] Stripe plans: Base / Pro / Power
- [ ] Enforce limits by plan (users, AI budget, reports)
- [ ] Upgrade/downgrade flows

### Epic 11 — Quality + security
- [ ] Server-side tests for RLS + critical endpoints
- [ ] Add rate limits on AI endpoints
- [ ] Add PII redaction before embeddings
- [ ] Add production error tracking

## 14) Open questions (answer these early)

1) Is the paid product “coach-led” (you sell services) or “self-serve SaaS”?
2) Do you want construction defaults baked in, or stay industry-agnostic?
3) What is the non-negotiable daily action? (Check-in, or something else?)

