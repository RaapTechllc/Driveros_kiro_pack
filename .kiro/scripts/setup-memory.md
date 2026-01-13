# Orchestrator Memory Setup

Run these commands to enable persistent memory for your orchestrator:

## 1. Enable Knowledge Feature (CLI)

```bash
kiro-cli settings chat.enableKnowledge true
kiro-cli settings knowledge.indexType Best
```

## 2. Initialize Orchestrator Knowledge Base

When using the orchestrator agent, run:

```bash
/knowledge add --name "specs" --path .kiro/specs --index-type Best
/knowledge add --name "steering" --path .kiro/steering --index-type Best
/knowledge add --name "progress" --path . --include "PLAN.md" --include "PROGRESS.md" --index-type Fast
```

## 3. Verify Setup

```bash
/knowledge show
```

## Memory Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 ORCHESTRATOR MEMORY                      │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Immediate Context (in-session)                │
│  - Current task from tasks.md                           │
│  - Active spec files                                    │
│  - Recent conversation                                  │
├─────────────────────────────────────────────────────────┤
│  Layer 2: File-Based State (persistent files)           │
│  - PLAN.md → Task checklist                             │
│  - PROGRESS.md → Real-time status                       │
│  - activity.log → Execution timeline                    │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Knowledge Base (semantic search)              │
│  - Past specs → Design decisions                        │
│  - Steering files → Project context                     │
│  - Completed work → Searchable history                  │
└─────────────────────────────────────────────────────────┘
```

## Usage Patterns

### Starting a New Feature
```
> @plan-feature user authentication

Orchestrator will:
1. Search knowledge: "authentication" → Find related past work
2. Load steering files for project context
3. Create new spec with informed decisions
```

### Resuming Work
```
> What's the status of the auth feature?

Orchestrator will:
1. Read PROGRESS.md for current state
2. Search knowledge for "auth feature" decisions
3. Provide context-aware summary
```

### After Completing a Phase
```
Orchestrator automatically:
1. Updates PROGRESS.md
2. Stores key decisions in knowledge
3. Summarizes for next session
```

## Maintenance

### Update Knowledge After Major Changes
```bash
/knowledge update .kiro/specs
```

### Clear Stale Knowledge
```bash
/knowledge remove "old-feature-specs"
```
