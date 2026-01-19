# Requirements - Goal Guardrails

## Overview
Goal Guardrails enforce alignment by requiring new actions or ideas to link to the current North Star, vehicle, and constraint; unaligned items are parked instead of entering execution flow.

## User Stories

### US-1: Enforce Alignment on New Actions
**As a** team member
**I want** to link new actions to the North Star
**So that** work stays aligned to the core goal

**Acceptance Criteria (EARS):**
- WHEN a user creates a new action, THE SYSTEM SHALL require selecting a North Star (goal, vehicle, constraint).
- IF an action cannot be linked to the North Star, THEN the system shall offer to park it instead of creating it.

### US-2: Park Unaligned Ideas
**As a** team lead
**I want** an inbox for unaligned ideas
**So that** I can revisit them without cluttering execution

**Acceptance Criteria (EARS):**
- WHEN an unaligned idea is parked, THE SYSTEM SHALL store it as a `parked_ideas` record with a reason.
- WHEN viewing the parked ideas list, THE SYSTEM SHALL allow promoting an item into an action once aligned.

## Functional Requirements
- FR-1: Add guardrail checks to action creation flows (UI + data layer).
- FR-2: Require North Star linkage for actions in production mode.
- FR-3: Provide a parked ideas list with ability to promote to actions.
- FR-4: Keep demo mode behavior unchanged.

## Non-Functional Requirements
- NFR-1: Performance - guardrail validation must be instant (<200ms) on the client.
- NFR-2: Security - only org members with write access can create actions or park ideas.
- NFR-3: Accessibility - parked ideas list must support keyboard navigation.

## Out of Scope
- AI-based scoring for alignment.
- Automatic deletion of parked ideas.

## Open Questions
- [ ] Should parked ideas be visible to coaches by default?
- [ ] Do we allow multiple North Stars or only the active one?
