---
description: Plan a DriverOS feature (hackathon scope)
---

# Plan a new task

## Feature: $ARGUMENTS

## Mission
Create a plan that can be executed in one pass.
Do not write code in this phase.

## Rules (must follow)
- Respect `.kiro/steering/scope.md`.
- No external integrations.
- Max 3 departments.
- Accelerator cadence is weekly.
- One sentence rationale.

## Planning steps

### 1) Define outcome
- What screen changes?
- What data changes?
- What is the acceptance test?

### 2) Read what matters
- Read relevant steering docs.
- Read the PRD and questionnaire files in docs/.
- Grep for similar patterns in code.

### 3) Decide minimal design
- Flash Scan vs Full Audit?
- What objects are created?
- What API routes exist?
- What CSV headers are needed?

### 4) Testing plan
- Unit tests for scoring and validation.
- Playwright flow if UI changes.

## Output format
Write the plan as a markdown file.
Include:

1) Feature description (1 paragraph)
2) User story (2 lines)
3) Files to read first (paths)
4) Files to create / modify (paths)
5) Step-by-step tasks (numbered)
6) Validation commands
7) Test cases (unit + e2e)
8) Demo steps (how a judge sees it)
