# Requirements - Daily Check-In

## Overview
The Daily Check-In feature provides a fast, one-screen habit loop that captures whether users completed their 1–3 actions, any blockers, and a win/lesson, then updates the workspace with this daily execution signal.

## User Stories

### US-1: Complete a Daily Check-In
**As a** team member
**I want** a 1-minute daily check-in form
**So that** I can quickly log execution progress and blockers

**Acceptance Criteria (EARS):**
- WHEN a signed-in user opens the daily check-in screen, THE SYSTEM SHALL show exactly three prompts: action completion, blocker, and win/lesson.
- WHEN the user submits the check-in, THE SYSTEM SHALL store a `check_ins` record for that user and org for today.
- IF a check-in already exists for the day, THEN the system shall show the existing entry and allow editing until the end of the day.

### US-2: See Daily Check-In Status
**As a** team lead
**I want** to see that a check-in was completed
**So that** I can verify the team’s execution rhythm

**Acceptance Criteria (EARS):**
- WHEN viewing the dashboard, THE SYSTEM SHALL indicate whether today’s check-in is complete.
- IF a check-in is missing after the local day end, THEN the system shall mark it as missed.

## Functional Requirements
- FR-1: Provide a single-screen check-in UI with three inputs (boolean completion, blocker text, win/lesson text).
- FR-2: Persist check-ins to `check_ins` with `org_id`, `user_id`, and `date`.
- FR-3: Allow editing the same-day check-in and prevent duplicate rows for the same user/date/org.
- FR-4: Update any related action statuses if the user marks completion (rules engine only).

## Non-Functional Requirements
- NFR-1: Performance - form submission must complete within 1 second on broadband.
- NFR-2: Security - users can only access their own check-ins within their org (RLS enforced).
- NFR-3: Accessibility - inputs must be keyboard navigable and labeled.

## Out of Scope
- Automated reminders via email/SMS/Slack.
- AI-generated summaries of check-ins.

## Open Questions
- [ ] Should users be allowed to edit check-ins from previous days?
- [ ] What timezone should define the “day” (org timezone or user timezone)?
