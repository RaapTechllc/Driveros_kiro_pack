# Requirements - Weekly Pit Stop

## Overview
The Weekly Pit Stop generates a focused plan for the upcoming week using existing signals (North Star, accelerator trend, blockers, and recent misses), then lets a user approve 1–3 actions with a single click.

## User Stories

### US-1: Generate a Weekly Plan
**As a** team lead
**I want** a weekly plan suggestion
**So that** I can quickly decide what to execute next week

**Acceptance Criteria (EARS):**
- WHEN a user opens the weekly pit stop screen, THE SYSTEM SHALL generate a proposed plan capped at 3 actions.
- WHEN the user approves the plan, THE SYSTEM SHALL create actions in the org’s backlog with `do_now` or `do_next` priority.
- IF the user declines the plan, THEN the system shall allow manual edits and re-generation.

### US-2: Review Last Week
**As a** team lead
**I want** a quick view of last week’s completed and missed actions
**So that** I can anchor planning decisions

**Acceptance Criteria (EARS):**
- WHEN viewing the weekly pit stop, THE SYSTEM SHALL show the previous week’s completed and missed actions.
- IF there are open blockers, THEN the system shall surface them in the planning view.

## Functional Requirements
- FR-1: Provide a weekly planning UI with a proposed action list and approval step.
- FR-2: Cap the plan to a maximum of 3 actions.
- FR-3: Record the pit stop as a `meeting` of type `pit_stop` with notes/decisions.
- FR-4: On approval, create actions with proper owner/engine/priority fields.

## Non-Functional Requirements
- NFR-1: Performance - plan generation must complete within 5 seconds.
- NFR-2: Security - only org members with write access can approve and create actions.
- NFR-3: Reliability - plan generation should fall back to rules engine if AI is unavailable.

## Out of Scope
- Fully automated action assignment without approval.
- Coach-facing multi-org weekly summaries.

## Open Questions
- [ ] Should weekly plans be generated per org or per user?
- [ ] What day of week triggers the default planning cycle?
