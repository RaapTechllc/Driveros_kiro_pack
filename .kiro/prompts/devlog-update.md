---
description: Append a clean DEVLOG entry for this slice
---

Update `DEVLOG.md`.
Append a new entry at the top (after the existing header).

## Entry format
```
## YYYY-MM-DD - [Slice Name]

### What Changed
- [Key change 1]
- [Key change 2]
- [Key change 3]

### Why It Matters
- [Business/demo impact]
- [Technical improvement]

### Commands Run
```bash
npm test  # X/X tests passing
npm run build  # ✅ or ❌
```

### Files Modified
- [path/to/file.ts] - [brief description]
- [path/to/file.tsx] - [brief description]

### Demo Impact
- [What judges will see differently]
- [New capabilities available]

### Next Steps
- [Next highest priority item]

---
```

## Rules
- Be honest about status
- Short, clear sentences
- Focus on demo readiness
- Include test results
- No marketing fluff
