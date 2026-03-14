# Agent Self-Evolution Protocol

This steering file defines the self-healing and continuous improvement protocol for all custom agents.

## Core Principle: 1% Better Every Session

Every agent session should end with a reflection that identifies at least one improvement opportunity. These improvements accumulate over time, making agents progressively more capable.

## Self-Reflection Trigger

At the end of any significant work session (completing a task, encountering errors, or when explicitly asked), agents should:

1. **Reflect** on what worked and what didn't
2. **Diagnose** root causes of any friction or failures
3. **Propose** specific improvements
4. **Record** learnings in the evolution log

## Reflection Framework: Roses, Buds, Thorns (RBT)

### 🌹 Roses (Strengths to Preserve)
- What worked well this session?
- Which tools were most effective?
- What prompt patterns produced good results?

### 🌱 Buds (Opportunities to Explore)
- What could be improved with minor tweaks?
- Are there tools that would help but aren't currently available?
- What patterns emerged that could be formalized?

### 🌵 Thorns (Failures to Fix)
- What errors occurred and why?
- What took longer than expected?
- What was confusing or unclear?

## Evolution Log Location

All agents should record their evolution insights to:
```
~/.kiro/evolution/[agent-name]-evolution.md
```

This is a GLOBAL location (user home directory) so improvements persist across projects.

## Evolution Log Format

```markdown
# [Agent Name] Evolution Log

## Session: [Date] - [Brief Description]

### Context
- Project: [project name or "general"]
- Task: [what was attempted]
- Duration: [approximate time]

### RBT Analysis

#### 🌹 Roses
- [What worked well]

#### 🌱 Buds  
- [Improvement opportunities]

#### 🌵 Thorns
- [Failures and friction points]

### Proposed Changes

#### Prompt Improvements
```
[Specific prompt text to add/modify]
```

#### Tool Recommendations
- [Tools to add or configure differently]

#### Resource Suggestions
- [Files or patterns to include in context]

### Confidence Score
[1-10] - How confident are you these changes will help?

### Applied
[ ] Not yet applied
[x] Applied on [date]
```

## Self-Healing Behaviors

### On Error Detection
When an agent encounters an error:
1. Log the error context and stack trace
2. Attempt self-diagnosis using available tools
3. If fixable, apply the fix and continue
4. If not fixable, document the failure pattern for future prevention

### On Tool Failure
When a tool doesn't work as expected:
1. Check if the tool exists and is properly configured
2. Verify permissions and paths
3. Suggest tool additions or configuration changes
4. Document workarounds that succeeded

### On Context Gaps
When missing information causes problems:
1. Identify what information was needed
2. Suggest resources to add to agent config
3. Propose steering file additions for common patterns

## Improvement Categories

### Prompt Evolution
- Add specific instructions for common failure modes
- Include examples of good outputs
- Add constraints that prevent past mistakes
- Refine workflow descriptions

### Tool Evolution
- Add tools that would have helped
- Remove tools that cause confusion
- Adjust tool permissions for efficiency
- Configure tool settings for common patterns

### Resource Evolution
- Add files that provide useful context
- Remove resources that add noise
- Adjust glob patterns for better coverage

## Guardrails

### Core Identity Protection
Never modify these aspects of an agent:
- The agent's fundamental purpose
- Security-critical constraints
- Model selection (unless explicitly requested)

### Change Limits
- Maximum 3 prompt additions per session
- Maximum 2 tool changes per session
- All changes must be reversible

### Human Review Triggers
Flag for human review when:
- Confidence score < 5
- Change affects security settings
- Multiple consecutive failures on same issue
- Proposed change contradicts existing instructions

## Integration with Hooks

Agents can use hooks to automate evolution:

```json
{
  "hooks": {
    "stop": [
      {
        "command": "echo 'Session complete. Initiating self-reflection...'"
      }
    ]
  }
}
```

## Continuous Improvement Cycle

```
┌─────────────────────────────────────────────────────────┐
│                    AGENT SESSION                         │
├─────────────────────────────────────────────────────────┤
│  1. Execute task with current configuration             │
│  2. Monitor for errors, friction, and successes         │
│  3. At session end, trigger RBT reflection              │
│  4. Record insights to evolution log                    │
│  5. Propose specific improvements                       │
│  6. Apply high-confidence changes (or flag for review)  │
│  7. Next session benefits from improvements             │
└─────────────────────────────────────────────────────────┘
```

## Example Evolution Entry

```markdown
## Session: 2026-01-12 - Database Migration Review

### Context
- Project: driveros
- Task: Review and optimize Prisma schema
- Duration: ~45 minutes

### RBT Analysis

#### 🌹 Roses
- Successfully identified N+1 query in card listing
- Prisma schema analysis was thorough
- Index recommendations were accurate

#### 🌱 Buds
- Could benefit from automatic query plan analysis
- Would help to have common Prisma anti-patterns in prompt

#### 🌵 Thorns
- Missed that `@@index` was already defined (wasted time)
- Didn't check existing migrations before suggesting changes
- Shell command for `prisma format` failed (not in PATH)

### Proposed Changes

#### Prompt Improvements
Add to prompt:
"Before suggesting schema changes, always:
1. Check existing indexes with `grep -r '@@index' prisma/`
2. Review recent migrations in `prisma/migrations/`
3. Verify Prisma CLI availability with `npx prisma --version`"

#### Tool Recommendations
- Add `shell:npx` to allowedTools (was missing)

#### Resource Suggestions
- Add `file://prisma/migrations/**/migration.sql` to resources

### Confidence Score
8 - High confidence these changes prevent the specific issues encountered

### Applied
[ ] Not yet applied
```
