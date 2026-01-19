# Design - Goal Guardrails

## Architecture Overview
- **UI**: Add guardrail checks to action creation flows (wherever actions are created).
- **Data**: Use `actions` and `parked_ideas` tables (already in schema).
- **North Star**: Use active North Star per org (future data layer in Sprint 2).

## Data Flow
1. When user attempts to create an action, fetch active North Star.
2. Require user to confirm linkage to goal/vehicle/constraint.
3. If user cannot align, offer to park the idea and capture reason.
4. Create `parked_ideas` entry or action accordingly.

## UI Behavior
- Action creation form includes alignment fields (goal/vehicle/constraint selection).
- “Park it” option appears when alignment is missing.
- Parked ideas list includes “Promote to action” flow.

## Error Handling
- Prevent action creation without alignment in production mode.
- Validate park reason required when parking.

## Testing Strategy
- Unit tests for guardrail validation.
- UI test for parking flow and promotion to action.
