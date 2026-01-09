# Testing rules

## Must have
- Unit tests for:
  - completion score (audit gate at 0.70)
  - engine scoring normalization
  - gear mapping thresholds
  - accelerator recommendation mapping
  - CSV import validation

## Playwright E2E must cover
1. Start Flash Scan.
2. Submit Flash Scan.
3. See dashboard with quick wins.
4. Upgrade to Full Audit.
5. Submit Full Audit.
6. See 5 engine cards.
7. Export goals/actions CSV.

## Quality bar
- No skipped tests in main branch.
- Tests must be deterministic.
- Run tests in CI (or a single local script) before demo.
