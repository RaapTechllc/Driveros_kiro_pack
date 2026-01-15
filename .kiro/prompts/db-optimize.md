# Database Optimization

Analyze database schema and queries for performance optimization.

## Analysis Areas

1. **Schema Review**
   - Index coverage for common queries
   - Appropriate data types
   - Relationship efficiency
   - Missing constraints

2. **Query Analysis**
   - N+1 query detection
   - Unnecessary data fetching
   - Missing pagination
   - Inefficient joins

3. **Prisma Patterns**
   - Proper use of `include` vs `select`
   - Transaction usage
   - Connection pooling

## Workflow

1. Review `prisma/schema.prisma`
2. Scan API routes for database queries
3. Identify optimization opportunities

## Output Format

For each finding:
- **Location**: File and query
- **Issue**: What's inefficient
- **Impact**: Performance cost
- **Fix**: Optimized approach
- **Before/After**: Code comparison

Focus on high-impact optimizations first.
