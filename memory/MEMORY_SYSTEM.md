# 🧠 AI Memory System - Universal Implementation Guide

**Give this document to any AI assistant to set up persistent context management for your project.**

---

## The Problem

AI assistants lose all context between sessions. Every new conversation starts from zero, forcing you to re-explain your project repeatedly. This wastes time and leads to inconsistent decisions.

## The Solution

**Active Documentation** — A structured set of Markdown files that serve as the AI's persistent memory. These files become the **single source of truth**, not chat history.

**Core Principle:** *"Files, not chat. Documents, not memory. Receipts, not vibes."*

---

## 📁 Folder Structure

```
/your-project/
├── memory/
│   ├── MEMORY_SYSTEM.md       ← Operating instructions (this file)
│   ├── project_brief.md       ← Static: Goals, stack, non-negotiables
│   ├── active_state.md        ← Dynamic: Current status, next steps
│   ├── system_patterns.md     ← Learnings: Standards, gotchas, patterns
│   └── adr/                   ← Architecture Decision Records
│       ├── 000-template.md
│       ├── 001-[decision].md
│       └── ...
```

---

## 🤖 AI Operating Protocol

### PHASE 1: Session Start (Bootloader)

**Trigger:** User says "Read Context", "Load Memory", or starts a new session

**AI must:**
1. Read `project_brief.md` (static context)
2. Read `active_state.md` (current status)
3. Read `system_patterns.md` (standards & gotchas)
4. Scan recent ADRs if relevant to current work
5. Summarize what you learned in 3-5 bullet points
6. Ask: "What should we work on today?"

**Example Response:**
```
✅ Context Loaded

Project: [Name] - [One-line description]
Current Phase: [Phase name]
Last Session: [What was accomplished]
Blockers: [Any critical issues]
Next Priority: [Top item from Next Actions]

What should we tackle first?
```

---

### PHASE 2: Active Work (Runtime)

**During the session:**
- Reference `active_state.md` for current focus
- Check `system_patterns.md` before making architectural decisions
- Track what you're accomplishing (prepare for handoff)
- Create ADRs for significant decisions

**When encountering repeated issues:**
- Add to `system_patterns.md` → "Known Gotchas" section

**When making big decisions:**
- Create new ADR: `adr/XXX-decision-name.md`

---

### PHASE 3: Session End (Handoff)

**Trigger:** User says "End Session", "Save Context", or "Update Memory"

**AI must update these files:**

1. **`active_state.md`:**
   - Move completed items to "Done This Session"
   - Update "Current Focus" to next priority
   - Add any new blockers or landmines
   - Update "Next Actions" checklist

2. **`system_patterns.md`** (if you learned something new):
   - New coding standards discovered
   - New gotchas encountered
   - Patterns that worked well

3. **Create ADR** (if a significant decision was made):
   - Architectural choices
   - Technology selections
   - Design pattern adoptions

4. **Confirm handoff:**
```
✅ Memory Updated

Files Modified:
- active_state.md (next focus: [X])
- system_patterns.md (added: [Y])
- adr/004-[decision].md (created)

Next session starts here: [1-sentence summary]
```

---

## 🔄 Quick Reference Commands

| User Says | AI Does |
|-----------|---------|
| "Read Context" / "Load Memory" | Read all memory files, summarize status |
| "End Session" / "Save Context" | Update active_state.md, system_patterns.md, create ADRs |
| "What's next?" | Check active_state.md → Next Actions |
| "What did we decide about X?" | Search ADRs |
| "Why do we do X?" | Check system_patterns.md or ADRs |
| "Initialize memory" | Create folder structure and templates |

---

## ✅ Validation Checklist

After loading context, the AI should be able to answer:
- [ ] What is this project's mission?
- [ ] What's the current focus/priority?
- [ ] What was done last session?
- [ ] What are the "Do Not Forget" landmines?
- [ ] What's next on the TODO list?
- [ ] What tech stack are we using?

If the AI can't answer these → context load failed → re-read files.

---

## 🚨 Rules for AI

### DO:
- ✅ **Always read context files at session start** (even if you "remember")
- ✅ **Update active_state.md at every session end**
- ✅ **Create ADRs for significant decisions**
- ✅ **Add gotchas to system_patterns.md** when discovered
- ✅ **Reference specific file paths** when discussing code

### DON'T:
- ❌ **Rely on chat history** (files are the source of truth)
- ❌ **Skip reading files** ("I remember" = probably wrong)
- ❌ **Fabricate file contents** (if unsure, read the actual file)
- ❌ **Update files mid-session** without being asked
- ❌ **Leave status board outdated** (causes next-session confusion)

---

**Version:** 2.0  
**License:** Use freely, modify as needed
