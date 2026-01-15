# Requirements Document

## Introduction

This document defines the requirements for an Agent-Prompt Integration System that creates formal bindings between agents and prompts, enables self-evolution through automated improvements, and integrates Playwright verification into the agent workflow. The system incorporates best practices from the Ralph Loop methodology (autonomous iteration until completion) and the Kiro Evolution Protocol (agent-evolution.md self-improvement framework). The system aims to make agents progressively more capable through a continuous improvement loop.

## Glossary

- **Agent**: A specialized AI assistant configuration defined in JSON format with specific tools, resources, and prompts
- **Prompt**: A reusable instruction template stored in `.kiro/prompts/` that agents can invoke
- **Evolution_Log**: A markdown file tracking agent improvements at `~/.kiro/evolution/[agent-name]-evolution.md`
- **Handoff**: A structured delegation file enabling agents to invoke other agents with context
- **Smoke_Test**: A fast subset of Playwright tests tagged with `@smoke` for quick verification
- **RBT_Analysis**: Roses, Buds, Thorns reflection framework for identifying improvements (from Kiro Evolution Protocol)
- **Ralph_Loop**: An autonomous iteration pattern where agents loop until all tasks complete, using `<promise>DONE</promise>` as completion signal
- **HITL_Mode**: Human-in-the-loop mode where agent runs once and human reviews
- **AFK_Mode**: Away-from-keyboard mode where agent loops autonomously with max iterations cap
- **Progress_File**: A file (PROGRESS.md) tracking task status between iterations (🔄 PENDING → 🟡 IN_PROGRESS → ✅ COMPLETED)
- **Feedback_Loop**: Automated verification using types, tests, and linting as guardrails

## Requirements

### Requirement 1: Agent-Prompt Binding System

**User Story:** As a developer, I want agents to have formal bindings to relevant prompts, so that agents automatically invoke appropriate prompts during their workflows.

#### Acceptance Criteria

1. WHEN an agent configuration is loaded, THE Agent_System SHALL recognize a `prompts` section containing `onStart`, `onComplete`, `available`, and `autoTrigger` fields
2. WHEN an agent session begins, THE Agent_System SHALL automatically invoke all prompts listed in the `onStart` array
3. WHEN an agent completes a task, THE Agent_System SHALL automatically invoke all prompts listed in the `onComplete` array
4. WHEN an agent writes a file, THE Agent_System SHALL check the `autoTrigger.afterWrite` array and invoke matching prompts
5. WHEN an agent encounters an error, THE Agent_System SHALL check the `autoTrigger.afterError` array and invoke matching prompts
6. THE Agent_System SHALL make all prompts in the `available` array accessible to the agent during execution

### Requirement 2: Prompt-Driven Agent Evolution

**User Story:** As a developer, I want the self-reflection prompt to generate actionable improvements that can be automatically applied, so that agents continuously improve without manual intervention.

#### Acceptance Criteria

1. WHEN the `@self-reflect` prompt completes with confidence >= 8, THE Evolution_System SHALL generate a JSON patch for the agent's configuration
2. THE `@apply-evolution` prompt SHALL read the evolution log from `~/.kiro/evolution/[agent-name]-evolution.md`
3. WHEN `@apply-evolution` executes, THE Evolution_System SHALL extract high-confidence improvements from the evolution log
4. WHEN `@apply-evolution` executes, THE Evolution_System SHALL apply extracted improvements to the agent configuration file
5. WHEN `@apply-evolution` modifies an agent config, THE Evolution_System SHALL commit the change with a descriptive message
6. THE `@verify-evolution` prompt SHALL run the agent on a test task and compare performance before and after changes
7. IF `@verify-evolution` detects a regression, THEN THE Evolution_System SHALL rollback the changes

### Requirement 3: Playwright Verification Integration

**User Story:** As a developer, I want agents to automatically verify their code changes with Playwright tests, so that regressions are caught immediately.

#### Acceptance Criteria

1. THE `@verify-changes` prompt SHALL run `npx playwright test --grep @smoke` for quick verification after code changes
2. IF smoke tests pass, THEN THE Verification_System SHALL run `npx playwright test` for the full test suite
3. IF tests fail, THEN THE Verification_System SHALL invoke `@rca` prompt to diagnose the failure
4. THE Verification_System SHALL report results in a structured format with status indicators (✅, ⚠️, ❌)
5. WHEN an agent writes a file, THE Agent_System SHALL trigger smoke tests via hooks
6. THE Smoke_Test suite SHALL complete in less than 30 seconds
7. THE Smoke_Test suite SHALL cover critical paths: homepage, Flash Scan, Full Audit, and Dashboard

### Requirement 4: Sub-Agent Delegation Flow

**User Story:** As a developer, I want agents to delegate tasks to other specialized agents with proper context, so that complex workflows can be distributed effectively.

#### Acceptance Criteria

1. WHEN the orchestrator delegates to a specialist, THE Delegation_System SHALL create a handoff file at `.kiro/handoffs/[timestamp]-[agent]-[task].md`
2. THE handoff file SHALL include task description, relevant file references, expected output, and success criteria
3. THE specialist agent SHALL read the handoff file and execute the task
4. WHEN a specialist completes a task, THE Delegation_System SHALL write results back to the handoff file
5. THE orchestrator SHALL read results from the handoff file and continue execution
6. THE `@handoff-create` prompt SHALL generate properly formatted handoff files
7. THE `@handoff-complete` prompt SHALL mark handoffs as complete and summarize results

### Requirement 5: Continuous Improvement Loop

**User Story:** As a developer, I want a complete feedback loop where agents execute, verify, reflect, evolve, and verify again, so that the system continuously improves itself.

#### Acceptance Criteria

1. WHEN an agent session starts, THE Agent_System SHALL execute the `@prime` prompt to load context
2. WHEN an agent completes a task, THE Agent_System SHALL execute `@verify-changes` for Playwright smoke tests
3. WHEN verification completes, THE Agent_System SHALL execute `@self-reflect` for RBT analysis
4. IF self-reflection confidence >= 8, THEN THE Agent_System SHALL execute `@apply-evolution`
5. WHEN evolution is applied, THE Agent_System SHALL execute `@verify-evolution` to test the improvement
6. THE Agent_System SHALL log all evolution activities to the evolution file
7. THE next agent session SHALL benefit from applied improvements

### Requirement 6: Smoke Test Suite Creation

**User Story:** As a developer, I want a fast smoke test suite that covers critical paths, so that agents can quickly verify their changes don't break core functionality.

#### Acceptance Criteria

1. THE Smoke_Test suite SHALL be located at `tests/e2e/smoke.spec.ts`
2. THE Smoke_Test suite SHALL tag all tests with `@smoke` annotation
3. THE Smoke_Test suite SHALL test the homepage loads correctly
4. THE Smoke_Test suite SHALL test card creation flow works
5. THE Smoke_Test suite SHALL test Dashboard loads properly
6. THE Smoke_Test suite SHALL complete execution in under 30 seconds
7. THE Smoke_Test suite SHALL provide clear pass/fail output

### Requirement 7: New Prompt Creation

**User Story:** As a developer, I want new prompts for verification, evolution, and delegation, so that agents have the tools needed for the continuous improvement loop.

#### Acceptance Criteria

1. THE `@verify-changes` prompt SHALL exist at `.kiro/prompts/verify-changes.md`
2. THE `@apply-evolution` prompt SHALL exist at `.kiro/prompts/apply-evolution.md`
3. THE `@verify-evolution` prompt SHALL exist at `.kiro/prompts/verify-evolution.md`
4. THE `@handoff-create` prompt SHALL exist at `.kiro/prompts/handoff-create.md`
5. THE `@handoff-complete` prompt SHALL exist at `.kiro/prompts/handoff-complete.md`
6. EACH prompt SHALL include clear instructions, expected inputs, and output format

### Requirement 8: Agent Configuration Updates

**User Story:** As a developer, I want all existing agents updated with prompt bindings and verification hooks, so that they participate in the continuous improvement system.

#### Acceptance Criteria

1. EACH agent configuration SHALL include a `prompts` section with appropriate bindings
2. EACH agent configuration SHALL include `@self-reflect` in the `onComplete` prompts
3. EACH agent configuration SHALL include hooks for auto-verification after file writes
4. THE orchestrator agent SHALL include delegation-related prompts in its `available` array
5. EACH agent's resources SHALL include relevant prompt files

### Requirement 9: Ralph Loop Integration

**User Story:** As a developer, I want agents to operate in Ralph Loop mode with autonomous iteration until completion, so that complex tasks can be completed without constant human intervention.

#### Acceptance Criteria

1. EACH agent configuration SHALL include a `completion` field defining the completion signal (e.g., `<promise>DONE</promise>`)
2. EACH agent configuration SHALL include a `max_iterations` field to cap autonomous loops (default: 25)
3. WHEN an agent starts a Ralph Loop session, THE Agent_System SHALL read PLAN.md to identify assigned tasks
4. WHEN an agent completes an iteration, THE Agent_System SHALL update PROGRESS.md with status (🔄 PENDING → 🟡 IN_PROGRESS → ✅ COMPLETED)
5. THE Agent_System SHALL support both HITL_Mode (single iteration with human review) and AFK_Mode (autonomous looping)
6. WHEN all assigned tasks show ✅ COMPLETED in PROGRESS.md, THE Agent_System SHALL output the completion signal
7. THE Agent_System SHALL log progress to activity.log for monitoring

### Requirement 10: Feedback Loop Integration

**User Story:** As a developer, I want agents to use automated feedback loops (types, tests, linting) as guardrails, so that code quality is maintained during autonomous operation.

#### Acceptance Criteria

1. WHEN an agent writes code, THE Feedback_System SHALL run TypeScript type checking
2. WHEN an agent writes code, THE Feedback_System SHALL run ESLint for linting
3. WHEN an agent writes code, THE Feedback_System SHALL run relevant tests
4. IF any feedback loop fails, THEN THE Agent_System SHALL attempt to fix the issue before continuing
5. THE Agent_System SHALL track feedback loop results in the progress file
6. WHEN feedback loops pass, THE Agent_System SHALL commit the code with a descriptive message

### Requirement 11: Kiro Evolution Protocol Compliance

**User Story:** As a developer, I want the system to comply with the Kiro Evolution Protocol (agent-evolution.md), so that self-improvement follows established guardrails and patterns.

#### Acceptance Criteria

1. THE Evolution_System SHALL follow the RBT (Roses, Buds, Thorns) reflection framework
2. THE Evolution_System SHALL record evolution insights to `~/.kiro/evolution/[agent-name]-evolution.md`
3. THE Evolution_System SHALL limit changes to maximum 3 prompt additions per session
4. THE Evolution_System SHALL limit changes to maximum 2 tool changes per session
5. THE Evolution_System SHALL flag for human review when confidence score < 5
6. THE Evolution_System SHALL flag for human review when changes affect security settings
7. THE Evolution_System SHALL never modify an agent's fundamental purpose or security-critical constraints
8. ALL evolution changes SHALL be reversible
