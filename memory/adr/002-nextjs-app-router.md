# ADR-002: Next.js App Router with TypeScript

**Status:** Accepted
**Date:** 2026-01-06
**Deciders:** Kiro Planning Agent, Builder Agent

## Context

Need to select a frontend framework that provides good developer experience, type safety, and production readiness for the DriverOS hackathon project.

## Options Considered

1. **Create React App:**
   - Pros: Simple setup, well-known
   - Cons: Deprecated, no built-in routing, manual configuration

2. **Vite + React:**
   - Pros: Fast development, modern tooling
   - Cons: Manual routing setup, more configuration needed

3. **Next.js 14 with App Router:**
   - Pros: Built-in routing, TypeScript support, production-ready, static export
   - Cons: Learning curve for App Router, some complexity

## Decision

We will use **Next.js 14 with App Router and TypeScript**.

**Rationale:**
- Built-in file-based routing perfect for our page structure
- Excellent TypeScript integration out of the box
- Static export capability for easy deployment
- Production-ready with good performance defaults
- Tailwind CSS integration is seamless

## Consequences

### Positive
- Type safety across the entire application
- File-based routing matches our page structure perfectly
- Built-in optimization and production readiness
- Easy static deployment for judges
- Great developer experience

### Negative
- App Router learning curve
- Some Next.js-specific patterns to learn
- Slightly more complex than plain React

### Mitigations
- Focus on simple patterns, avoid advanced Next.js features
- Use 'use client' directive for interactive components
- Stick to basic App Router patterns

## References

- Next.js 14 documentation
- TypeScript best practices
- Hackathon deployment requirements
