# ADR-001: Client-Side Only Architecture

**Status:** Accepted
**Date:** 2026-01-06
**Deciders:** Kiro Planning Agent, Builder Agent

## Context

DriverOS needs to be a hackathon MVP that judges can easily install and run. We need to decide on the architecture approach for data persistence and business logic.

## Options Considered

1. **Full-Stack with Database:**
   - Pros: Proper data persistence, multi-user support, scalable
   - Cons: Complex setup, requires database, hosting costs, deployment complexity

2. **Client-Side with External APIs:**
   - Pros: Leverages existing services, rich integrations
   - Cons: Violates hackathon scope (no external integrations), network dependencies

3. **Client-Side Only with localStorage:**
   - Pros: Zero setup, works offline, no hosting costs, judge-friendly
   - Cons: Single-user only, data not persistent across devices

## Decision

We will use **Client-Side Only with localStorage**.

**Rationale:**
- Hackathon scope explicitly forbids external integrations
- Judges need "install and run" simplicity
- Demo scenarios work perfectly with single-user localStorage
- Eliminates all deployment and hosting complexity
- Allows focus on business logic rather than infrastructure

## Consequences

### Positive
- Zero setup complexity for judges
- Works completely offline
- No hosting or infrastructure costs
- Fast development iteration
- Perfect for hackathon demo scenarios

### Negative
- Single-user limitation
- Data doesn't persist across devices/browsers
- No real-time collaboration
- Limited scalability

### Mitigations
- CSV import/export provides data portability
- Clear documentation that this is MVP architecture
- Future ADR can address multi-user architecture post-hackathon

## References

- `.kiro/steering/scope.md` - "No external integrations"
- `.kiro/steering/product.md` - Judge demo requirements
