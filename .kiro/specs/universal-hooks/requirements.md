# Requirements Document

## Introduction

This document defines the requirements for a Universal Hooks System that provides a standardized set of hooks applicable across all agents in the DriverOS project. Universal hooks enable consistent behavior for code quality, verification, logging, and self-improvement across the entire agent ecosystem. The system integrates with the Ralph Loop methodology, Kiro Evolution Protocol, and Thread-Based Engineering framework for continuous improvement and scalable agent operations.

## Glossary

- **Universal_Hook**: A hook configuration that applies to all agents regardless of their specialization
- **Hook_Event**: A lifecycle point where hooks can execute (agentSpawn, userPromptSubmit, preToolUse, postToolUse, stop)
- **Hook_Matcher**: A pattern that determines which tools trigger a hook (e.g., "write", "@git", "*")
- **Kiro_Hook_File**: A `.kiro.hook` file in `.kiro/hooks/` that defines event-triggered agent behaviors
- **Agent_Hook**: Hooks defined within an agent's JSON configuration
- **Feedback_Loop**: Automated verification using TypeScript, ESLint, and tests as guardrails
- **Activity_Log**: A file (`activity.log`) tracking agent actions and progress
- **Thread**: A unit of engineering work over time driven by prompts and agent tool calls
- **Base_Thread**: Single prompt → agent work → review cycle
- **P_Thread**: Parallel threads running simultaneously for increased throughput
- **C_Thread**: Chained threads with checkpoints for phased work
- **F_Thread**: Fusion threads combining results from multiple agents
- **B_Thread**: Big threads with nested sub-agent calls
- **L_Thread**: Long-running autonomous threads with high autonomy
- **Z_Thread**: Zero-touch threads with maximum trust (no human review needed)
- **Stop_Hook**: Hook that runs when agent finishes, enabling loop continuation or completion

## Requirements

### Requirement 1: Universal Code Quality Hooks

**User Story:** As a developer, I want all agents to automatically run code quality checks after writing files, so that code quality is maintained consistently across all agent operations.

#### Acceptance Criteria

1. WHEN any agent writes a TypeScript file, THE Universal_Hook_System SHALL run TypeScript type checking
2. WHEN any agent writes a TypeScript or JavaScript file, THE Universal_Hook_System SHALL run ESLint
3. WHEN any agent writes a test file, THE Universal_Hook_System SHALL run the affected tests
4. IF a code quality check fails, THEN THE Universal_Hook_System SHALL return the error to the agent for correction
5. THE Universal_Hook_System SHALL support configurable timeout for quality checks (default: 30 seconds)

### Requirement 2: Universal Verification Hooks

**User Story:** As a developer, I want all agents to automatically run smoke tests after significant code changes, so that regressions are caught immediately.

#### Acceptance Criteria

1. WHEN any agent writes to `src/**/*.ts` or `src/**/*.tsx`, THE Universal_Hook_System SHALL trigger Playwright smoke tests
2. THE smoke test hook SHALL run `npx playwright test --grep @smoke` with a 30-second timeout
3. IF smoke tests fail, THEN THE Universal_Hook_System SHALL return failure details to the agent
4. THE Universal_Hook_System SHALL cache successful smoke test results for 60 seconds to avoid redundant runs
5. THE Universal_Hook_System SHALL support bypassing verification for documentation-only changes

### Requirement 3: Universal Logging Hooks

**User Story:** As a developer, I want all agent activities logged consistently, so that I can monitor and debug agent behavior across the system.

#### Acceptance Criteria

1. WHEN any agent session starts (agentSpawn), THE Universal_Hook_System SHALL log the session start to activity.log
2. WHEN any agent writes a file, THE Universal_Hook_System SHALL log the file path and timestamp
3. WHEN any agent session ends (stop), THE Universal_Hook_System SHALL log the session end with duration
4. THE Universal_Hook_System SHALL include agent name, timestamp, and action type in all log entries
5. THE Universal_Hook_System SHALL rotate logs when activity.log exceeds 1MB

### Requirement 4: Universal Self-Reflection Hooks

**User Story:** As a developer, I want all agents to automatically trigger self-reflection at session end, so that the continuous improvement loop is consistently applied.

#### Acceptance Criteria

1. WHEN any agent session ends (stop), THE Universal_Hook_System SHALL trigger the self-reflection prompt
2. THE self-reflection hook SHALL invoke `@self-reflect` prompt with session context
3. THE Universal_Hook_System SHALL pass session duration, files modified, and errors encountered to self-reflection
4. IF self-reflection generates high-confidence improvements, THEN THE Universal_Hook_System SHALL flag them for review
5. THE Universal_Hook_System SHALL record self-reflection results to the evolution log

### Requirement 5: Universal Security Hooks

**User Story:** As a developer, I want all agents to have security guardrails that prevent dangerous operations, so that the system remains safe during autonomous operation.

#### Acceptance Criteria

1. WHEN any agent attempts to write outside allowed paths, THE Universal_Hook_System SHALL block the operation
2. WHEN any agent attempts to execute shell commands, THE Universal_Hook_System SHALL validate against an allowlist
3. WHEN any agent attempts to delete files, THE Universal_Hook_System SHALL require confirmation or block
4. THE Universal_Hook_System SHALL log all blocked operations for security audit
5. THE Universal_Hook_System SHALL support configurable security levels (strict, moderate, permissive)

### Requirement 6: Universal Context Hooks

**User Story:** As a developer, I want all agents to automatically load relevant context at session start, so that they have the information needed to work effectively.

#### Acceptance Criteria

1. WHEN any agent session starts (agentSpawn), THE Universal_Hook_System SHALL load PLAN.md if it exists
2. WHEN any agent session starts, THE Universal_Hook_System SHALL load PROGRESS.md if it exists
3. WHEN any agent session starts, THE Universal_Hook_System SHALL load recent git status
4. THE Universal_Hook_System SHALL add loaded context to the agent's initial context
5. THE Universal_Hook_System SHALL support configurable context sources per project

### Requirement 7: Universal Progress Tracking Hooks

**User Story:** As a developer, I want all agents to automatically update progress tracking files, so that task status is always current.

#### Acceptance Criteria

1. WHEN any agent completes a task, THE Universal_Hook_System SHALL update PROGRESS.md with completion status
2. THE Universal_Hook_System SHALL use status indicators (🔄 PENDING → 🟡 IN_PROGRESS → ✅ COMPLETED)
3. WHEN any agent encounters an error, THE Universal_Hook_System SHALL mark the task as ❌ FAILED
4. THE Universal_Hook_System SHALL include timestamps in progress updates
5. THE Universal_Hook_System SHALL support custom progress file locations

### Requirement 8: Hook Configuration Management

**User Story:** As a developer, I want to manage universal hooks through a central configuration, so that I can easily enable, disable, or customize hooks across all agents.

#### Acceptance Criteria

1. THE Universal_Hook_System SHALL store configuration in `.kiro/hooks/universal-hooks.json`
2. THE configuration SHALL support enabling/disabling individual hooks
3. THE configuration SHALL support customizing hook parameters (timeouts, paths, patterns)
4. THE configuration SHALL support hook priority ordering
5. THE Universal_Hook_System SHALL validate configuration on load and report errors

### Requirement 9: Hook File Generation

**User Story:** As a developer, I want universal hooks to be generated as `.kiro.hook` files, so that they integrate with Kiro's native hook system.

#### Acceptance Criteria

1. THE Universal_Hook_System SHALL generate `.kiro.hook` files for each universal hook
2. EACH generated hook file SHALL follow the Kiro hook schema (enabled, name, description, version, when, then)
3. THE Universal_Hook_System SHALL support both `fileEdited` and `agentMessage` trigger types
4. THE Universal_Hook_System SHALL support file pattern matching for targeted hooks
5. THE Universal_Hook_System SHALL regenerate hook files when configuration changes

### Requirement 10: Hook Integration with Agent Configs

**User Story:** As a developer, I want universal hooks to be automatically included in agent configurations, so that all agents benefit from universal behaviors without manual configuration.

#### Acceptance Criteria

1. THE Universal_Hook_System SHALL provide a mechanism to inject hooks into agent configs
2. THE Universal_Hook_System SHALL not override agent-specific hooks
3. THE Universal_Hook_System SHALL merge universal hooks with agent hooks by event type
4. THE Universal_Hook_System SHALL support agent-level opt-out from specific universal hooks
5. THE Universal_Hook_System SHALL document which universal hooks are active for each agent


### Requirement 11: Thread-Based Engineering Support

**User Story:** As a developer, I want universal hooks to support thread-based engineering patterns, so that I can scale my agent operations through parallelism, chaining, and fusion.

#### Acceptance Criteria

1. THE Universal_Hook_System SHALL support Base_Thread pattern (single prompt → work → review)
2. THE Universal_Hook_System SHALL support P_Thread pattern through parallel agent spawning hooks
3. THE Universal_Hook_System SHALL support C_Thread pattern through checkpoint hooks that pause for review
4. THE Universal_Hook_System SHALL support F_Thread pattern through result aggregation hooks
5. THE Universal_Hook_System SHALL support B_Thread pattern through sub-agent orchestration hooks
6. THE Universal_Hook_System SHALL support L_Thread pattern through long-running loop hooks with stop hook validation
7. THE Universal_Hook_System SHALL track thread type and duration in activity logs

### Requirement 12: Stop Hook Loop Control

**User Story:** As a developer, I want stop hooks to enable Ralph Loop continuation or completion, so that agents can run autonomously until work is verified complete.

#### Acceptance Criteria

1. WHEN an agent session ends (stop), THE Stop_Hook SHALL check if work is complete via validation
2. IF work is not complete, THEN THE Stop_Hook SHALL signal continuation of the loop
3. IF work is complete, THEN THE Stop_Hook SHALL signal completion with `<promise>DONE</promise>`
4. THE Stop_Hook SHALL check PROGRESS.md for task completion status
5. THE Stop_Hook SHALL run validation commands (tests, type checks) before signaling completion
6. THE Stop_Hook SHALL support configurable max iterations to prevent infinite loops
7. THE Stop_Hook SHALL log loop iteration count and validation results

### Requirement 13: Thread Metrics and Improvement Tracking

**User Story:** As a developer, I want to track thread metrics, so that I can measure and improve my agentic engineering capabilities.

#### Acceptance Criteria

1. THE Universal_Hook_System SHALL track total tool calls per thread
2. THE Universal_Hook_System SHALL track thread duration (start to completion)
3. THE Universal_Hook_System SHALL track thread type (Base, P, C, F, B, L, Z)
4. THE Universal_Hook_System SHALL track human intervention points (checkpoints, reviews)
5. THE Universal_Hook_System SHALL calculate autonomy score (tool calls / human interventions)
6. THE Universal_Hook_System SHALL store metrics in `.kiro/metrics/thread-metrics.json`
7. THE Universal_Hook_System SHALL provide trend analysis for improvement tracking

### Requirement 14: Zero-Touch Thread Support

**User Story:** As a developer, I want to configure agents for zero-touch operation, so that trusted workflows can run without human review.

#### Acceptance Criteria

1. THE Universal_Hook_System SHALL support Z_Thread configuration for maximum trust workflows
2. THE Z_Thread configuration SHALL require explicit opt-in per agent
3. THE Z_Thread configuration SHALL require passing validation criteria (tests, type checks)
4. THE Z_Thread configuration SHALL support automatic commit on successful completion
5. THE Z_Thread configuration SHALL maintain audit log of all autonomous actions
6. IF Z_Thread validation fails, THEN THE Universal_Hook_System SHALL fall back to human review
7. THE Z_Thread configuration SHALL support configurable trust levels per operation type
