# Strands Review

Context efficiency review using the deletion hierarchy.

## Arguments: $ARGUMENTS

- No args: Review recent git changes
- File path: Review specific file
- `--all`: Full codebase scan (slow)

## Process

### 1. Gather Context
```bash
# Recent changes (default)
git diff --name-only HEAD~5

# Or specific file
wc -l $ARGUMENTS

# LOC summary
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1
```

### 2. Apply Deletion Hierarchy

For each file, ask in order:

1. **QUESTION**: Why does this exist? What breaks if deleted?
2. **DELETE**: Dead code? Unused imports? Redundant abstractions?
3. **SIMPLIFY**: Can multiple things become one?
4. **ACCELERATE**: Any performance wins in what remains?
5. **AUTOMATE**: Should this be generated instead of written?

### 3. Output Format

```
## DELETE (immediate wins)
- [file:line] reason

## CONSOLIDATE (merge opportunities)  
- [files] → [target] reason

## SIMPLIFY (reduce complexity)
- [target] → [simpler form] reason

## KEEP (earns its place)
- [target] why essential

## Score: X/10
```

### 4. Integration

If issues found:
- DELETE items → Fix immediately
- CONSOLIDATE → Create task in PLAN.md
- SIMPLIFY → Evaluate effort vs. payoff

Feed critical findings to `@code-review-fix` if needed.

---

**"The best part is no part."**
