---
description: DriverOS hackathon readiness review (100 point rubric)
---

Perform a hackathon readiness review.

## Check list
- App runs from a clean clone.
- One command install. One command start.
- Flash Scan works.
- Full Audit works.
- Dashboard renders.
- CSV export/import works.
- Light and dark mode toggle works.
- Tests exist and pass.

## Evidence to gather
```bash
ls -la
find . -maxdepth 3 -name "README*" -o -name "DEVLOG*" -o -path "./.kiro/*" | sed -n '1,200p'
tree -L 3 -I 'node_modules|.git|dist|build|.next|.turbo' || true
```

## Scoring (100 points)

### 1) Application Quality (40)
- Functionality & completeness (15)
- Real-world value (15)
- Code quality (10)

### 2) Kiro CLI Usage (20)
- Local prompts quality (10)
- Steering docs quality (7)
- Workflow innovation (3)

### 3) Documentation (20)
- README install + demo steps (9)
- Clarity (7)
- Process transparency in DEVLOG (4)

### 4) Innovation (15)
- Clear differentiation (8)
- Smart constraints and UX (7)

### 5) Presentation (5)
- Demo script quality (3)
- Screenshots or GIFs (2)

## Output
Produce:
- overall score
- scores per section
- top 5 fixes to raise the score fast
