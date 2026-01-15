# Demo Rehearsal

Execute a complete demo rehearsal with timing validation and performance monitoring.

## Workflow
1. **Environment Reset**: Clean database, restart services, clear browser cache
2. **Demo Execution**: Run complete demo script with timing measurements
3. **Performance Validation**: Check leaderboard <2s, API <500ms targets
4. **Fallback Testing**: Simulate API failures and verify graceful degradation
5. **Report Generation**: Create detailed timing and performance report

## Success Criteria
- Demo completes in <7 minutes
- All critical paths work
- Performance targets met
- Fallback scenarios functional
- No crashes or errors

## Output Format
- Timing breakdown by demo section
- Performance metrics for each page
- Error log (if any)
- Recommendations for optimization