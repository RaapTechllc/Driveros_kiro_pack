# Security and safety

## Product safety
- This is business coaching support.
- Not legal, tax, or accounting advice.
- If risk is high, require human review.

## Data handling
- Do not store secrets in the repo.
- Do not log raw PII.
- In demo seed data, use fake names and fake numbers.

## Risk flags (brakes)
If any are true, set risk_level = high and show controls:
- severe cash risk (very long cash cycle or low runway if provided)
- compliance issues (regulated industry flags)
- extreme workload/burnout signals (if captured)

Controls examples:
- “Human review required before acting.”
- “Confirm with a licensed professional.”

## Tool safety for agents
- Prefer read/grep/glob first.
- Write only in allowed project paths.
- Shell commands should be minimal and safe.
