---
description: Session starter - Load project context and memory
---

# Prime: Load Context & Start Session

## Objective
Load all available project memory and context to start a productive session.

## Steps

### 1) Initialize Memory System (if needed)
If `memory/` directory doesn't exist, create basic structure:
- Create `memory/` directory
- Create `memory/project_brief.md` with template
- Create `memory/active_state.md` with template  
- Create `memory/system_patterns.md` with template
- Create `memory/adr/` directory with `000-template.md`

### 2) Load Memory System (graceful)
Read these files if they exist, skip if missing:
- `memory/project_brief.md` (static context)
- `memory/active_state.md` (current status)  
- `memory/system_patterns.md` (standards & gotchas)
- Recent ADRs in `memory/adr/` (scan directory, read recent ones)

### 3) Load Steering Context (optional)
Read steering files if they exist, skip if missing:
- `.kiro/steering/product.md`
- `.kiro/steering/scope.md` 
- `.kiro/steering/domain-model.md`
- `.kiro/steering/scoring.md`
- Any other `.md` files in `.kiro/steering/`

### 4) Load Project Context (fallback)
If memory system is empty, scan project structure:
- `README.md` (project overview)
- `package.json` (tech stack)
- `DEVLOG.md` or `CHANGELOG.md` (recent progress)

## Output Format
```
✅ Context Loaded

Project: [Name from project_brief or README]
Memory System: [✅ Complete | 🟡 Partial | ⬜ New]
Current Phase: [Phase from active_state or "Unknown"]
Last Session: [What was accomplished or "First session"]
Blockers: [Any critical issues or "None identified"]
Next Priority: [Top item from Next Actions or "Define priorities"]

Ready to work. What should we tackle first?
```

## Error Handling
- If no memory files exist → Initialize new system
- If files exist but are corrupted → Report issues, continue with available data
- If no project context found → Ask user to provide basic project info
- Always provide actionable next steps regardless of available context

## Success Criteria
After running @prime, I should be able to answer (or know what's missing):
- What is this project's mission?
- What's the current focus/priority?
- What was done last session?
- What are the "Do Not Forget" landmines?
- What's next on the TODO list?
