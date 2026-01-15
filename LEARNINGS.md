# Project Learnings

Corrections, preferences, and patterns discovered during development.
This file is automatically updated by the self-improvement system.

**Principle: Correct once, never again.**

---

## Corrections
- [2026-01-15] CORRECTION: Simplified orchestrator setup - too many prompts/agents caused confusion
- [2026-01-15] CORRECTION: E2E page objects drifted from actual component text - always verify selectors match current UI

## Preferences
- Use `npm run dev` on port 3060 (not 3000)
- Keep rationales to one sentence
- Follow racing metaphor (Gear, Engine, Accelerator, Brakes)

## Patterns
- Flash Scan → instant value in <5 minutes
- Full Audit → detailed 5-engine scoring
- Dashboard → unified view with Signal Board
- E2E selectors should use `name` attributes over placeholder text (more stable)

## Anti-Patterns
- Don't add external integrations (hackathon constraint)
- Don't exceed 3 departments
- Don't use complex multi-step wizards
- Don't use placeholder text in E2E selectors (changes frequently)

---

*Last updated: 2026-01-15*

- [2026-01-15] CLEANUP: Eliminated 1556 lines - async/sync duplication, overengineered transcript parser, unused data-migration system
