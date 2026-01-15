# Brownfield Project Audit

Perform a comprehensive audit of this existing codebase for hackathon submission readiness.

## Arguments: $ARGUMENTS

If no arguments provided, audit the entire project.
If path provided, focus on that area.

---

## Phase 1: Discovery (DO NOT SKIP)

### 1.1 Project Structure Scan
```bash
# Run these commands and analyze output:
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.py" | head -50
cat package.json 2>/dev/null || cat pyproject.toml 2>/dev/null || cat Cargo.toml 2>/dev/null
ls -la
```

### 1.2 Identify Core Files
- Entry points (main, index, app)
- Configuration files
- Environment setup
- Database schemas/migrations

### 1.3 Check Health Indicators
```bash
# Dependencies
npm outdated 2>/dev/null || pip list --outdated 2>/dev/null

# Git status
git status
git log --oneline -10

# Existing tests
npm run test 2>/dev/null || pytest 2>/dev/null || echo "No tests found"

# Lint status
npm run lint 2>/dev/null || ruff check . 2>/dev/null
```

---

## Phase 2: Issue Identification

Create a findings document at `.kiro/specs/audits/brownfield-audit-{date}.md`

### Categories to Check:

#### 🔴 Critical (Blocks Demo)
- [ ] App crashes on startup
- [ ] Core features broken
- [ ] Missing environment variables
- [ ] Database connection failures
- [ ] Auth completely broken

#### 🟠 High (Visible in Demo)
- [ ] UI rendering issues
- [ ] API endpoints returning errors
- [ ] Slow performance (>3s responses)
- [ ] Console errors in browser
- [ ] Missing error handling

#### 🟡 Medium (Edge Cases)
- [ ] Validation gaps
- [ ] Missing loading states
- [ ] Poor mobile responsiveness
- [ ] Incomplete CRUD operations
- [ ] Hardcoded values that should be config

#### 🟢 Low (Polish)
- [ ] TypeScript `any` types
- [ ] Missing documentation
- [ ] Code duplication
- [ ] Unused imports/variables
- [ ] Inconsistent naming

---

## Phase 3: Create Action Plan

After discovery, create a PRD at `.kiro/specs/prds/hackathon-fixes.prd.md`

### PRD Structure:
```markdown
# PRD: Hackathon Submission Fixes

**Project:** {project name}
**Deadline:** {hackathon deadline}
**Status:** ACTIVE

## Goal
Make this project demo-ready for Kiro CLI hackathon submission.

## Critical Path
{List the minimum features that MUST work for a successful demo}

## Issues Found

### Critical (Must Fix)
| Issue | Location | Effort | Priority |
|-------|----------|--------|----------|
| ... | ... | S/M/L | P0 |

### High (Should Fix)
| Issue | Location | Effort | Priority |
|-------|----------|--------|----------|
| ... | ... | S/M/L | P1 |

### Medium (Nice to Fix)
| Issue | Location | Effort | Priority |
|-------|----------|--------|----------|
| ... | ... | S/M/L | P2 |

## Implementation Phases

| Phase | Focus | Status | Time Estimate |
|-------|-------|--------|---------------|
| 1 | Critical fixes | PENDING | Xh |
| 2 | High priority | PENDING | Xh |
| 3 | Polish & docs | PENDING | Xh |

## Demo Script
{What will you show in the hackathon demo?}
1. ...
2. ...
3. ...

## Validation
- [ ] App starts without errors
- [ ] Core demo flow works end-to-end
- [ ] No console errors during demo
- [ ] README accurately describes the project
```

---

## Phase 4: Execute Fixes

For each phase in the PRD:

1. **Create detailed plan:**
   ```
   @create-plan .kiro/specs/prds/hackathon-fixes.prd.md
   ```

2. **Execute with validation:**
   ```
   @implement-plan .kiro/specs/plans/hackathon-fixes-phase-1.plan.md
   ```

3. **Verify before moving on:**
   ```bash
   npm run lint && npm run typecheck && npm run test
   ```

---

## Output Format

After completing Phase 1-2, present findings as:

```
## 🔍 Brownfield Audit Complete

**Project:** {name}
**Files Scanned:** {count}
**Health Score:** {X}/100

### Summary
- 🔴 Critical: {count}
- 🟠 High: {count}  
- 🟡 Medium: {count}
- 🟢 Low: {count}

### Top 5 Priorities
1. {issue} - {location} - {effort}
2. ...

### Recommended Action
{Your recommendation: fix critical issues first, then...}

### Files Created
- `.kiro/specs/audits/brownfield-audit-{date}.md`
- `.kiro/specs/prds/hackathon-fixes.prd.md`

Ready to proceed with Phase 1 fixes? (y/n)
```

---

## IMPORTANT

- DO NOT start fixing until discovery is complete
- DO NOT skip validation between phases
- DO focus on demo-critical paths first
- DO document everything you find
- DO ask for clarification on hackathon requirements if unclear
